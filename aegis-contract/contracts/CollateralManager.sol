// SPDX-License-Identifier:MIT

pragma solidity ^0.8.20;

// Intrefaces are like the blueprints of a contract that other contracts can implement:they contain all the functions that the contract will have.but do not contain logic inside them or retyurn any values.

//IERC20 is an interface for the ERC20 token that contains all the functions that the ERC20 token will have.

//Etherium Request for Comment (ERC) has a standard process for improving the Ethereum blockchain.ERC20 is a token standard that's used to create the fungible tokens on Ethereum blockchain.
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

/**
 * CollateralManager (MVP)
 * - Single collateral token + single debt token
 * - Fixed prices (owner-set) for quick hackathon demos
 * - LTV and Liquidation Threshold constants
 * - No interest for Day 1
 */
contract CollateralManager {
    //configurations

    address public owner;
    IERC20 public immutable collateralToken;
    IERC20 public immutable debtToken;
    uint8 private immutable collateralDec;
    uint8 private immutable debtDec;

    // solidity has no floating numbers only pure integers Scaling values by 1e18 simulates decimals so divisions like value/price retain precision when converted back down later. This avoids rounding losses and enables consistent calculations across functions such as “value in USD,” LTV, and health factor.
    uint256 public collateralPrice1e18;
    uint256 public debtPrice1e18;

    // risk parameters
    // here ew are defing the variables for the max we can borrow in respect to our collatreal submitted.
    uint256 public collateralFactor1e18;
    // the max limit set by the contract after certain limit at which the collateral will start liquidating if it crossed the threashold value.
    uint256 public liquidationThreshold1e18;

    // Reentrancy guard
    //Reentrancy happens when a contract makes an external call (for example, a token transfer) and the callee calls back into the original contract before the first call finishes, potentially manipulating state (like draining funds) before updates are finalized. A boolean lock prevents the second entry while the first call is still executing
    bool private locked;

    modifier nonReentrant() {
        require(!locked, "REENTRANCY");
        locked = true;
        _;
        locked = false;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "NOT_OWNER");
        _;
    }
    struct Position {
        uint256 collateral;
        uint256 debt;
    }
    mapping(address => Position) public positions;

    // Liquidity accounting (simple)
    uint256 public totalSuppliedLiquidity; // debt tokens supplied to pool (raw)
    uint256 public totalOutstandingDebt; // debt owed by users (raw)

    // --- events ---
    event PricesUpdated(uint256 collateralPrice1e18, uint256 debtPrice1e18);
    event RiskParamsUpdated(
        uint256 collateralFactor1e18,
        uint256 liquidationThreshold1e18
    );
    event LiquiditySupplied(address indexed supplier, uint256 amount);
    event LiquidityWithdrawn(address indexed to, uint256 amount);
    event CollateralDeposited(address indexed user, uint256 amount);
    event CollateralWithdrawn(address indexed user, uint256 amount);
    event Borrowed(address indexed user, uint256 amount);
    event Repaid(address indexed user, uint256 amount);

    constructor(
        address _collateralToken,
        address _debtToken,
        uint256 _collateralPrice1e18,
        uint256 _debtPrice1e18,
        uint256 _collateralFactor1e18, // e.g., 6e17 for 60%
        uint256 _liquidationThreshold1e18 // e.g., 8e17 for 80%
    ) {
        owner = msg.sender;
        collateralToken = IERC20(_collateralToken);
        debtToken = IERC20(_debtToken);
        collateralDec = IERC20Decimals(_collateralToken).decimals();
        debtDec = IERC20Decimals(_debtToken).decimals();
        require(_collateralPrice1e18 > 0 && _debtPrice1e18 > 0, "BAD_PRICES");
        require(_collateralFactor1e18 < _liquidationThreshold1e18, "FACTOR_LT");
        collateralPrice1e18 = _collateralPrice1e18;
        debtPrice1e18 = _debtPrice1e18;
        collateralFactor1e18 = _collateralFactor1e18;
        liquidationThreshold1e18 = _liquidationThreshold1e18;
    }

    // --- admin ---
    function setPrices(
        uint256 _collateralPrice1e18,
        uint256 _debtPrice1e18
    ) external onlyOwner {
        require(_collateralPrice1e18 > 0 && _debtPrice1e18 > 0, "BAD_PRICES");
        collateralPrice1e18 = _collateralPrice1e18;
        debtPrice1e18 = _debtPrice1e18;
        emit PricesUpdated(_collateralPrice1e18, _debtPrice1e18);
    }

    function setRiskParams(
        uint256 _collateralFactor1e18,
        uint256 _liquidationThreshold1e18
    ) external onlyOwner {
        require(_collateralFactor1e18 < _liquidationThreshold1e18, "FACTOR_LT");
        collateralFactor1e18 = _collateralFactor1e18;
        liquidationThreshold1e18 = _liquidationThreshold1e18;
        emit RiskParamsUpdated(
            _collateralFactor1e18,
            _liquidationThreshold1e18
        );
    }

    // --- liquidity (for Day 1 demo; naive pool) ---
    function supplyLiquidity(uint256 amount) external nonReentrant {
        require(amount > 0, "ZERO");
        require(
            debtToken.transferFrom(msg.sender, address(this), amount),
            "TRANSFER_FAIL"
        );
        totalSuppliedLiquidity += amount;
        emit LiquiditySupplied(msg.sender, amount);
    }

    function withdrawLiquidity(uint256 amount) external onlyOwner nonReentrant {
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
    function depositCollateral(uint256 amount) external nonReentrant {
        require(amount > 0, "ZERO");
        require(
            collateralToken.transferFrom(msg.sender, address(this), amount),
            "TRANSFER_FAIL"
        );
        positions[msg.sender].collateral += amount;
        emit CollateralDeposited(msg.sender, amount);
    }

    function borrow(uint256 amount) external nonReentrant {
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

    function withdrawCollateral(uint256 amount) external nonReentrant {
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
        require(collateralToken.transfer(msg.sender, amount), "TRANSFER_FAIL");
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
        return (norm * collateralPrice1e18) / 1e18;
    }

    function _valueOfDebt1e18(uint256 debtRaw) internal view returns (uint256) {
        uint256 norm = _to1e18(debtRaw, debtDec);
        return (norm * debtPrice1e18) / 1e18;
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
}
