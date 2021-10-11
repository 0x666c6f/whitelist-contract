const { isMockup, getValueFromBigMap, exprMichelineToJson, packTyped, packTypedAll, blake2b, getAddress, sign, taquitoExecuteSchema, keccak } = require('@completium/completium-cli');
const assert = require('assert');

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

let cpt = 0;
exports.generateArchetypeId = () => {
  // return ethers.utils.hexZeroPad(randomBytes(32))
  return ++cpt;
}

exports.pauseAndVerify = async (c, a) => {
  await c.pause({ as: a.pkh });
  let storage = await c.getStorage();
  assert(storage.paused == true, "contract should be paused");
}

exports.unpauseAndVerify = async (c, a) => {
  await c.unpause({ as: a.pkh });
  let storage = await c.getStorage();
  assert(storage.paused == false, "contract should not be paused");
}

exports.getArchetypeData = async (c, key) => {
  let storage = await c.getStorage();
  if (isMockup()) {
    const bmid = storage.archetypeLedger;
    const jval = await getValueFromBigMap(bmid, { int: key }, { prim: "nat" });
    const tval = exprMichelineToJson("(pair (address %archValidator) (nat %maxBalanceAllowed))");
    const r = taquitoExecuteSchema(jval, tval);
    return r;
  } else {
    return await storage.archetypeLedger.get(key);
  }
}

const mkPairs = l => {
  if (l.length == 1) {
    return l[0];
  } else
    return {
      prim: 'Pair',
      args: [
        l[0],
        mkPairs(l.slice(1, l.length))
      ]
    }
}

exports.mkPairs = args => mkPairs(args)

exports.getFA2Balance = (gbfa2) => {
  return async (fa2, o, t) => {
    await gbfa2.execBalanceof({ arg : { fa2 : fa2.address, owner : o, tokenid : t } });
    const storage = await gbfa2.getStorage();
    return storage.toNumber();
  }
}

exports.getQuartzOwner = (archetypeGettertester) => {
  return async (id) => {
    await archetypeGettertester.execGetOwner({ arg : { tokenid : id } });
    let storage = await archetypeGettertester.getStorage();
    return storage.res_owner;
  }
}

exports.getQuartzUri = (archetypeGettertester) => {
  return async (id) => {
    await archetypeGettertester.execUri({ arg : { tokenid : id } });
    let storage = await archetypeGettertester.getStorage();
    return storage.res_uri;
  }
}

exports.checkFA2Balance = (gbfa2) => {
  return async (fa2, o, t, v) => {
    await gbfa2.execBalanceof({ arg : { fa2 : fa2.address, owner : o, tokenid : t } });
    const storage = await gbfa2.getStorage();
    const res = storage.toNumber();
    if (res !== v) {
      throw new Error("Invalid balance of: expected " + v + ", got " + res);
    }
  }
}

const transferParamType = exprMichelineToJson("(list (pair (address %from_) (list %txs (pair (address %to_) (nat %token_id) (nat %amount)))))");
const permitDataType = exprMichelineToJson("(pair (pair address chain_id) (pair nat bytes))");

exports.mkTransferPermit = async (from, to, amount, tokenid, permit_counter) => {
  const michelsonData = `{ Pair "${from.pkh}" { Pair "${to.pkh}" (Pair ${tokenid} ${amount}) } }`;
  const transferParam = exprMichelineToJson(michelsonData);
  const permit  = packTyped(transferParam, transferParamType);
  const hashPermit = blake2b(permit);
  const fa2Address = getAddress('fa2-feeless-wrapper');
  const chainid = isMockup() ? "NetXynUjJNZm7wi" : "NetXz969SFaFn8k"; // else granada
  const permitData = exprMichelineToJson(`(Pair (Pair "${fa2Address}" "${chainid}") (Pair ${permit_counter} 0x${hashPermit}))`);
  const tosign = packTyped(permitData, permitDataType);
  const signature = await sign(tosign, { as : from.name });
  return { hash : hashPermit, sig : signature };
}

const tokenIdType = {
  prim: 'pair',
  args: [
    { prim: 'nat' },
    { prim: 'nat' }
  ]
}

exports.getTokenId = (archetypeid, serial) => {
  const a = mkPairs([{"int" : archetypeid.toString()}, { "int" : serial.toString()}]);
  const packed = packTyped(a, tokenIdType);
  const hexStr = keccak(packed).substring(0, 8);
  const b = "0x" + hexStr;
  const c = Number(b);
  return c.toString();
}

exports.errors = {
  INVALID_CALLER: '"InvalidCaller"',
  FA2_INSUFFICIENT_BALANCE: '"FA2_INSUFFICIENT_BALANCE"',
  FA2_NOT_OPERATOR: '"FA2_NOT_OPERATOR"',
  ARCHETYPE_ALREADY_REGISTERED: '"Archetype already registered"',
  ARCHETYPE_INVALID_VALIDATOR: '"Archetype requires a minting validator contract address"',
  ARCHETYPE_NOT_REGISTERED: '"Archetype not registered"',
  LIMIT_ALREADY_SET: '"MintingValidator: minting limit already set"',
  SERIAL_OOB: '"MintingValidator: serial number out of bounds"',
  ALREADY_MINTED: '"Token already minted"',
  DEADLINE_REACHED: '"MintingValidator: deadline reached"',
  DEADLINE_ALREADY_SET: '"MintingValidator: deadline already set"',
  MUST_BE_MINTER: '"Must be a minter"',
  DOES_NOT_EXIST: '"Token does not exist"',
  // NOT_WHITELISTED: '"Recipient is not whitelisted"',
  NOT_WHITELISTED: '"TO_NOT_ALLOWED"',
  WHITELIST_TO_RESTRICTED: '"TO_RESTRICTED"',
  NOT_ADMIN: '"Must be an administrator"',
  ERC1155_NOT_APPROVED: '"ERC1155: caller is not owner nor approved"',
  ERC1155_INSUFFICIENT_BALANCE: '"ERC1155: insufficient balance for transfer"',
  ARCHETYPE_QUOTA: '"Archetype quota reached"',
  COOLDOWN: '"Transfer cooldown"',
  USDC_WRONG_SIG: '"FiatTokenV2: invalid signature"',
  USDC_BALANCE_TOO_LOW: '"ERC20: transfer amount exceeds balance"',
  USDC_ALLOWANCE_TOO_LOW: '"ERC20: transfer amount exceeds allowance"',
  QUARTZ_MINTER_AUTHORIZATION_EXPIRED: '"QUARTZ_MINTER: authorization expired"',
  QUARTZ_MINTER_RECOVER_FAILED: '"QUARTZ_MINTER: invalid signature"',
  PAUSED: '"Pausable: paused"',
  NOT_PAUSED: '"Pausable: not paused"',
  META_TRANSACTION_WRONG_SIGNATURE: '"NativeMetaTransaction: WRONG_SIGNATURE"',
  USER_RESTRICTED: '"USER_RESTRICTED"',
  FROM_RESTRICTED: '"FROM_RESTRICTED"',
  TO_RESTRICTED: '"TO_RESTRICTED"',
  TO_NOT_ALLOWED: '"TO_NOT_ALLOWED"',
  FROM_NOT_WHITELISTED: '"FROM_NOT_WHITELISTED"',
  TO_NOT_WHITELISTED: '"TO_NOT_WHITELISTED"',
  FROM_TRANSFERLIST_NOT_FOUND: '"FROM_TRANSFERLIST_NOT_FOUND"',
  TO_TRANSFERLIST_NOT_FOUND: '"TO_TRANSFERLIST_NOT_FOUND"',
  FROM_INVALID_UNRESTRICTED_STATE: '"FROM_INVALID_UNRESTRICTED_STATE"',
  TO_INVALID_UNRESTRICTED_STATE: '"TO_INVALID_UNRESTRICTED_STATE"',
  TO_TRANSFERLIST_NOT_FOUND_IN_FROM: '"TO_TRANSFERLIST_NOT_FOUND_IN_FROM"',
  KEY_EXISTS: '"KEY_EXISTS"'
}
