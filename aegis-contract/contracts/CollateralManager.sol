// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import "./AccessControl.sol";
import "./Pausable.sol";
import "./RiskBounds.sol";

// Interfaces are like the blueprints of a contract that other contracts can implement: they contain all the functions that the contract will have but do not contain logic inside them or return any values.

// IERC20 is an interface for the ERC20 token that contains all the functions that the ERC20 token will have.

// Ethereum Request for Comment (ERC) has a standard process for improving the Ethereum blockchain. ERC20 is a token standard that's used to create the fungible tokens on Ethereum blockchain.
interface IERC20 {
    function totalSupply() external view returns (uint256);

    function balanceOf(address account) external view returns (uint256);

    function transfer(address to, uint256 amount) external returns (bool);

    function allowance(
        address owner,
        address spender,
        uint256 amount
    ) external view returns (uint256);

    function approve(address spender, uint256 amount) external returns (bool);

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool);

    // events in solidity are like the notifications that the contract sends to the outside world.

    //When a smart contract calls an event, it emits a signal that is saved on the blockchain in a special log. This log is not part of the contract's state (its variables), but is instead stored in a separate, cheaper part of the transaction

    event Transfer(address indexed from, address indexed to, uint256 amount);
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 amount
    );
}

//ERC20 is a token standard that's used to create the fungible tokens on Ethereum blockchain.

//IERC20Decimals is an interface for the ERC20 token that contains the function to get the decimals of the token.
interface IERC20Decimals {
    function decimals() external view returns (uint8);
}

// Price Oracle interface for getting token prices
interface IPriceOracle {
    function getPrice(address token) external view returns (uint256 price);

    function isValidPrice(address token) external view returns (bool isValid);

    function isPaused() external view returns (bool isPaused);
}

/**
 * CollateralManager (Enhanced Security Version)
 * - Single collateral token + single debt token
 * - Oracle-based prices with fallback to fixed prices
 * - LTV and Liquidation Threshold constants
 * - Role-based access control
 * - Emergency pause functionality
 * - Risk parameter bounds validation
 * - Timelock support for critical operations
 * - No interest for Day 1
 */
contract CollateralManager is AccessControl, Pausable {
    //configurations

    IERC20 public immutable collateralToken;
    IERC20 public immutable debtToken;
    uint8 private immutable collateralDec;
    uint8 private immutable debtDec;

    // Price oracle for dynamic pricing
    IPriceOracle public priceOracle;

    // Fallback prices (used when oracle is unavailable)
    uint256 public collateralPrice1e18;
    uint256 public debtPrice1e18;

    // Oracle configuration
    bool public useOracle = true;

    // Risk bounds contract for parameter validation
    RiskBounds public riskBounds;

    // risk parameters
    // here we are defining the variables for the max we can borrow in respect to our collateral submitted.
    uint256 public collateralFactor1e18;
    // the max limit set by the contract after certain limit at which the collateral will start liquidating if it crossed the threshold value.
    uint256 public liquidationThreshold1e18;

    // Timelock controller for delayed operations
    address public timelockController;

    // Reentrancy guard
    // Reentrancy happens when a contract makes an external call (for example, a token transfer) and the callee calls back into the original contract before the first call finishes, potentially manipulating state (like draining funds) before updates are finalized. A boolean lock prevents the second entry while the first call is still executing
    bool private locked;

    modifier nonReentrant() {
        require(!locked, "REENTRANCY");
        locked = true;
        _;
        locked = false;
    }

    modifier onlyOwner() {
        require(hasRole(OWNER_ROLE, msg.sender), "NOT_OWNER");
        _;
    }

    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, msg.sender), "NOT_ADMIN");
        _;
    }

    modifier onlyParameterRole() {
        require(hasRole(PARAMETER_ROLE, msg.sender), "NOT_PARAMETER_ROLE");
        _;
    }

    modifier onlyEmergencyRole() {
        require(hasRole(EMERGENCY_ROLE, msg.sender), "NOT_EMERGENCY_ROLE");
        _;
    }

    modifier onlyTimelockOrOwner() {
        require(
            msg.sender == timelockController || hasRole(OWNER_ROLE, msg.sender),
            "NOT_TIMELOCK_OR_OWNER"
        );
        _;
    }
    struct Position {
        uint256 collateral;
        uint256 debt;
    }
    mapping(address => Position) public positions;
    // optional externalized custody: user -> vault address
    mapping(address => address) public userVault;

    // Liquidity accounting (simple)
    uint256 public totalSuppliedLiquidity; // debt tokens supplied to pool (raw)
    uint256 public totalOutstandingDebt; // debt owed by users (raw)

    // --- events ---
    event PricesUpdated(uint256 collateralPrice1e18, uint256 debtPrice1e18);
    event RiskParamsUpdated(
        uint256 collateralFactor1e18,
        uint256 liquidationThreshold1e18
    );
    event OracleUpdated(address indexed oracle, bool useOracle);
    event LiquiditySupplied(address indexed supplier, uint256 amount);
    event LiquidityWithdrawn(address indexed to, uint256 amount);
    event CollateralDeposited(address indexed user, uint256 amount);
    event CollateralWithdrawn(address indexed user, uint256 amount);
    event Borrowed(address indexed user, uint256 amount);
    event Repaid(address indexed user, uint256 amount);
    event VaultCreated(address indexed user, address vault);
    event RiskBoundsUpdated(address indexed riskBounds);
    event TimelockControllerUpdated(address indexed timelockController);
    event EmergencyActionExecuted(address indexed executor, string action);

    constructor(
        address _collateralToken,
        address _debtToken,
        uint256 _collateralPrice1e18,
        uint256 _debtPrice1e18,
        uint256 _collateralFactor1e18, // e.g., 6e17 for 60%
        uint256 _liquidationThreshold1e18, // e.g., 8e17 for 80%
        address _riskBounds
    ) {
        collateralToken = IERC20(_collateralToken);
        debtToken = IERC20(_debtToken);
        collateralDec = IERC20Decimals(_collateralToken).decimals();
        debtDec = IERC20Decimals(_debtToken).decimals();
        require(_collateralPrice1e18 > 0 && _debtPrice1e18 > 0, "BAD_PRICES");
        require(_collateralFactor1e18 < _liquidationThreshold1e18, "FACTOR_LT");
        require(_riskBounds != address(0), "INVALID_RISK_BOUNDS");

        collateralPrice1e18 = _collateralPrice1e18;
        debtPrice1e18 = _debtPrice1e18;
        collateralFactor1e18 = _collateralFactor1e18;
        liquidationThreshold1e18 = _liquidationThreshold1e18;
        riskBounds = RiskBounds(_riskBounds);

        // Validate initial parameters against risk bounds
        require(
            riskBounds.validateCollateralFactor(_collateralFactor1e18),
            "INVALID_COLLATERAL_FACTOR"
        );
        require(
            riskBounds.validateLiquidationThreshold(_liquidationThreshold1e18),
            "INVALID_LIQUIDATION_THRESHOLD"
        );
    }

    // --- vault management ---
    function setUserVault(address vault) external {
        require(userVault[msg.sender] == address(0), "VAULT_SET");
        require(vault != address(0), "ZERO");
        userVault[msg.sender] = vault;
        emit VaultCreated(msg.sender, vault);
    }

    // --- admin ---
    function setPrices(
        uint256 _collateralPrice1e18,
        uint256 _debtPrice1e18
    ) external onlyParameterRole whenNotPaused {
        require(_collateralPrice1e18 > 0 && _debtPrice1e18 > 0, "BAD_PRICES");

        // Validate price deviation if oracle is available
        if (useOracle && address(priceOracle) != address(0)) {
            try priceOracle.getPrice(address(collateralToken)) returns (
                uint256 oraclePrice
            ) {
                if (oraclePrice > 0) {
                    require(
                        riskBounds.validatePriceDeviation(
                            _collateralPrice1e18,
                            oraclePrice
                        ),
                        "PRICE_DEVIATION_TOO_HIGH"
                    );
                }
            } catch {
                // Oracle unavailable, allow fallback price update
            }
        }

        collateralPrice1e18 = _collateralPrice1e18;
        debtPrice1e18 = _debtPrice1e18;
        emit PricesUpdated(_collateralPrice1e18, _debtPrice1e18);
    }

    function setRiskParams(
        uint256 _collateralFactor1e18,
        uint256 _liquidationThreshold1e18
    ) external onlyTimelockOrOwner whenNotPaused {
        require(_collateralFactor1e18 < _liquidationThreshold1e18, "FACTOR_LT");
        require(
            riskBounds.validateCollateralFactor(_collateralFactor1e18),
            "INVALID_COLLATERAL_FACTOR"
        );
        require(
            riskBounds.validateLiquidationThreshold(_liquidationThreshold1e18),
            "INVALID_LIQUIDATION_THRESHOLD"
        );
        require(
            riskBounds.validateThresholdHigherThanFactor(
                _collateralFactor1e18,
                _liquidationThreshold1e18
            ),
            "THRESHOLD_NOT_HIGHER_THAN_FACTOR"
        );

        collateralFactor1e18 = _collateralFactor1e18;
        liquidationThreshold1e18 = _liquidationThreshold1e18;
        emit RiskParamsUpdated(
            _collateralFactor1e18,
            _liquidationThreshold1e18
        );
    }

    // --- oracle management ---
    function setOracle(address _oracle) external onlyAdmin whenNotPaused {
        priceOracle = IPriceOracle(_oracle);
        emit OracleUpdated(_oracle, useOracle);
    }

    function setUseOracle(
        bool _useOracle
    ) external onlyParameterRole whenNotPaused {
        useOracle = _useOracle;
        emit OracleUpdated(address(priceOracle), _useOracle);
    }

    // --- risk bounds management ---
    function setRiskBounds(address _riskBounds) external onlyOwner {
        require(_riskBounds != address(0), "INVALID_RISK_BOUNDS");
        riskBounds = RiskBounds(_riskBounds);
        emit RiskBoundsUpdated(_riskBounds);
    }

    // --- timelock management ---
    function setTimelockController(
        address _timelockController
    ) external onlyOwner {
        timelockController = _timelockController;
        emit TimelockControllerUpdated(_timelockController);
    }

    // --- emergency functions ---
    function emergencyPause() external onlyEmergencyRole {
        pause();
        emit EmergencyActionExecuted(msg.sender, "PAUSE");
    }

    function emergencyUnpause() external onlyEmergencyRole {
        unpause();
        emit EmergencyActionExecuted(msg.sender, "UNPAUSE");
    }

    function emergencyWithdrawLiquidity(
        uint256 amount
    ) external onlyEmergencyRole whenPaused {
        require(amount > 0, "ZERO");
        uint256 poolBal = debtToken.balanceOf(address(this));
        require(amount <= poolBal, "INSUFFICIENT_POOL_BAL");
        require(debtToken.transfer(msg.sender, amount), "TRANSFER_FAIL");
        if (amount > totalSuppliedLiquidity) totalSuppliedLiquidity = 0;
        else totalSuppliedLiquidity -= amount;
        emit LiquidityWithdrawn(msg.sender, amount);
        emit EmergencyActionExecuted(msg.sender, "EMERGENCY_WITHDRAW");
    }

    function getCurrentCollateralPrice() public view returns (uint256) {
        if (useOracle && address(priceOracle) != address(0)) {
            try priceOracle.getPrice(address(collateralToken)) returns (
                uint256 price
            ) {
                if (priceOracle.isValidPrice(address(collateralToken))) {
                    return price;
                }
            } catch {
                // Fall through to fallback price
            }
        }
        return collateralPrice1e18;
    }

    function getCurrentDebtPrice() public view returns (uint256) {
        if (useOracle && address(priceOracle) != address(0)) {
            try priceOracle.getPrice(address(debtToken)) returns (
                uint256 price
            ) {
                if (priceOracle.isValidPrice(address(debtToken))) {
                    return price;
                }
            } catch {
                // Fall through to fallback price
            }
        }
        return debtPrice1e18;
    }

    // --- liquidity (for Day 1 demo; naive pool) ---
    function supplyLiquidity(
        uint256 amount
    ) external nonReentrant whenNotPaused {
        require(amount > 0, "ZERO");
        require(
            debtToken.transferFrom(msg.sender, address(this), amount),
            "TRANSFER_FAIL"
        );
        totalSuppliedLiquidity += amount;
        emit LiquiditySupplied(msg.sender, amount);
    }

    function withdrawLiquidity(
        uint256 amount
    ) external onlyAdmin nonReentrant whenNotPaused {
        require(amount > 0, "ZERO");
        // ensure pool stays solvent: cannot pull out what is lent
        uint256 poolBal = debtToken.balanceOf(address(this));
        require(amount <= poolBal, "INSUFFICIENT_POOL_BAL");
        require(debtToken.transfer(msg.sender, amount), "TRANSFER_FAIL");
        if (amount > totalSuppliedLiquidity) totalSuppliedLiquidity = 0;
        else totalSuppliedLiquidity -= amount;
        emit LiquidityWithdrawn(msg.sender, amount);
    }

    // --- user actions ---
    function depositCollateral(
        uint256 amount
    ) external nonReentrant whenNotPaused {
        require(amount > 0, "ZERO");
        address vault = userVault[msg.sender];
        address receiveTo = vault == address(0) ? address(this) : vault;
        require(
            collateralToken.transferFrom(msg.sender, receiveTo, amount),
            "TRANSFER_FAIL"
        );
        positions[msg.sender].collateral += amount;
        emit CollateralDeposited(msg.sender, amount);
    }

    function borrow(uint256 amount) external nonReentrant whenNotPaused {
        require(amount > 0, "ZERO");
        Position storage p = positions[msg.sender];

        // Check capacity: (debt + amount) <= maxBorrow (raw debt decimals)
        uint256 maxBorrowRaw = _maxBorrowableDebtRaw(p.collateral);
        require(p.debt + amount <= maxBorrowRaw, "EXCEEDS_LTV");

        // Pool must have liquidity
        require(debtToken.balanceOf(address(this)) >= amount, "POOL_EMPTY");

        p.debt += amount;
        totalOutstandingDebt += amount;

        require(debtToken.transfer(msg.sender, amount), "TRANSFER_FAIL");
        emit Borrowed(msg.sender, amount);
    }

    function repay(uint256 amount) external nonReentrant {
        require(amount > 0, "ZERO");
        Position storage p = positions[msg.sender];
        require(p.debt > 0, "NO_DEBT");
        if (amount > p.debt) amount = p.debt;

        require(
            debtToken.transferFrom(msg.sender, address(this), amount),
            "TRANSFER_FAIL"
        );
        p.debt -= amount;
        totalOutstandingDebt -= amount;
        emit Repaid(msg.sender, amount);
    }

    function withdrawCollateral(
        uint256 amount
    ) external nonReentrant whenNotPaused {
        require(amount > 0, "ZERO");
        Position storage p = positions[msg.sender];
        require(p.collateral >= amount, "INSUFFICIENT_COLLATERAL");

        // Simulate new state & verify it stays healthy vs LTV AND liquidation threshold
        uint256 newCollateral = p.collateral - amount;

        // If user still has debt, must remain safe
        if (p.debt > 0) {
            uint256 maxBorrowRaw = _maxBorrowableDebtRaw(newCollateral);
            require(p.debt <= maxBorrowRaw, "WOULD_BREAK_LTV");

            // also enforce health factor >= 1 at liquid. threshold
            require(
                _isHealthyAtLiquidationThreshold(newCollateral, p.debt),
                "WOULD_BE_UNHEALTHY"
            );
        }

        p.collateral = newCollateral;
        address vault = userVault[msg.sender];
        if (vault == address(0)) {
            require(
                collateralToken.transfer(msg.sender, amount),
                "TRANSFER_FAIL"
            );
        } else {
            // instruct vault to send tokens back to owner
            // call UserVault.sendToken(token, to, amount)
            (bool ok, ) = vault.call(
                abi.encodeWithSignature(
                    "sendToken(address,address,uint256)",
                    address(collateralToken),
                    msg.sender,
                    amount
                )
            );
            require(ok, "VAULT_SEND_FAIL");
        }
        emit CollateralWithdrawn(msg.sender, amount);
    }

    // --- views ---
    function getAccountData(
        address user
    )
        external
        view
        returns (
            uint256 collateralRaw,
            uint256 debtRaw,
            uint256 collateralValue1e18,
            uint256 debtValue1e18,
            uint256 maxBorrowDebtRaw,
            uint256 healthFactor1e18
        )
    {
        Position memory p = positions[user];
        collateralRaw = p.collateral;
        debtRaw = p.debt;

        collateralValue1e18 = _valueOfCollateral1e18(p.collateral);
        debtValue1e18 = _valueOfDebt1e18(p.debt);
        maxBorrowDebtRaw = _maxBorrowableDebtRaw(p.collateral);
        healthFactor1e18 = _healthFactor1e18(p.collateral, p.debt);
    }

    function healthFactor(address user) external view returns (uint256) {
        Position memory p = positions[user];
        return _healthFactor1e18(p.collateral, p.debt);
    }

    // --- compatibility getters (for tests expecting simple getters) ---
    function userCollateral(address user) external view returns (uint256) {
        return positions[user].collateral;
    }

    function userDebt(address user) external view returns (uint256) {
        return positions[user].debt;
    }

    // --- internals (math/normalization) ---
    function _to1e18(uint256 amt, uint8 dec) internal pure returns (uint256) {
        if (dec == 18) return amt;
        if (dec < 18) return amt * (10 ** (18 - dec));
        return amt / (10 ** (dec - 18));
    }

    function _from1e18(
        uint256 amt1e18,
        uint8 dec
    ) internal pure returns (uint256) {
        if (dec == 18) return amt1e18;
        if (dec < 18) return amt1e18 / (10 ** (18 - dec));
        return amt1e18 * (10 ** (dec - 18));
    }

    function _valueOfCollateral1e18(
        uint256 collateralRaw
    ) internal view returns (uint256) {
        uint256 norm = _to1e18(collateralRaw, collateralDec);
        uint256 currentPrice = getCurrentCollateralPrice();
        return (norm * currentPrice) / 1e18;
    }

    function _valueOfDebt1e18(uint256 debtRaw) internal view returns (uint256) {
        uint256 norm = _to1e18(debtRaw, debtDec);
        uint256 currentPrice = getCurrentDebtPrice();
        return (norm * currentPrice) / 1e18;
    }

    function _maxBorrowableDebtRaw(
        uint256 collateralRaw
    ) internal view returns (uint256) {
        // maxBorrowUSD = collateralValue * collateralFactor
        uint256 collVal = _valueOfCollateral1e18(collateralRaw);
        uint256 maxBorrowUSD1e18 = (collVal * collateralFactor1e18) / 1e18;

        // convert USD back to debt units: debtNorm = maxBorrowUSD / debtPrice
        uint256 debtNorm1e18 = (maxBorrowUSD1e18 * 1e18) / debtPrice1e18;
        return _from1e18(debtNorm1e18, debtDec);
    }

    function _healthFactor1e18(
        uint256 collateralRaw,
        uint256 debtRaw
    ) internal view returns (uint256) {
        if (debtRaw == 0) return type(uint256).max;
        // HF = (collateralValue * liquidationThreshold) / debtValue
        uint256 collVal = _valueOfCollateral1e18(collateralRaw);
        uint256 debtVal = _valueOfDebt1e18(debtRaw);
        return (collVal * liquidationThreshold1e18) / debtVal;
    }

    function _isHealthyAtLiquidationThreshold(
        uint256 collateralRaw,
        uint256 debtRaw
    ) internal view returns (bool) {
        return _healthFactor1e18(collateralRaw, debtRaw) >= 1e18;
    }

    // --- liquidation (basic) ---
    function liquidate(
        address user,
        uint256 repayAmount,
        address to
    ) external nonReentrant {
        require(repayAmount > 0, "ZERO");
        Position storage p = positions[user];
        require(p.debt > 0, "NO_DEBT");
        require(
            !_isHealthyAtLiquidationThreshold(p.collateral, p.debt),
            "HEALTHY"
        );

        if (repayAmount > p.debt) repayAmount = p.debt;

        // pull debt token from liquidator
        require(
            debtToken.transferFrom(msg.sender, address(this), repayAmount),
            "TRANSFER_FAIL"
        );
        p.debt -= repayAmount;
        totalOutstandingDebt -= repayAmount;

        // seize proportional collateral at 1:1 value basis for MVP
        // collToSeize1e18 = repayValueUSD / collateralPrice
        uint256 repayVal1e18 = _valueOfDebt1e18(repayAmount);
        uint256 seizeNorm1e18 = (repayVal1e18 * 1e18) / collateralPrice1e18;
        uint256 seizeRaw = _from1e18(seizeNorm1e18, collateralDec);
        if (seizeRaw > p.collateral) seizeRaw = p.collateral;
        p.collateral -= seizeRaw;

        address vault = userVault[user];
        if (vault == address(0)) {
            require(collateralToken.transfer(to, seizeRaw), "TRANSFER_FAIL");
        } else {
            (bool ok, ) = vault.call(
                abi.encodeWithSignature(
                    "sendToken(address,address,uint256)",
                    address(collateralToken),
                    to,
                    seizeRaw
                )
            );
            require(ok, "VAULT_SEND_FAIL");
        }
    }

    // --- additional view functions ---
    function getRiskBounds() external view returns (address) {
        return address(riskBounds);
    }

    function getTimelockController() external view returns (address) {
        return timelockController;
    }

    function isPaused() external view returns (bool) {
        return paused();
    }

    function hasRole(
        bytes32 role,
        address account
    ) public view override returns (bool) {
        return AccessControl.hasRole(role, account);
    }

    function getRoleAdmin(bytes32 role) public view override returns (bytes32) {
        return AccessControl.getRoleAdmin(role);
    }

    // --- ownership transfer functions ---
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "NEW_OWNER_ZERO");
        grantRole(OWNER_ROLE, newOwner);
        revokeRole(OWNER_ROLE, msg.sender);
    }

    function renounceOwnership() external onlyOwner {
        revokeRole(OWNER_ROLE, msg.sender);
    }
}
