# Whitelist smart contract

## Set up
This whitelist contract is coded in [Archetype](https://docs.archetype-lang.org/).
To be able to run the tests, you need to install the [Completium CLI](https://completium.com/docs/cli):
```bash
> npm i @completium/completium-cli -g
> completium-cli init
```

To run the tests, you have two options:
* Testnets
* Mockup mode

To use the mockup mode, you need to have the `tezos-client` installed. You can find instructions on how to do that here: https://assets.tqtezos.com/docs/setup/1-tezos-client/

To switch from Tesnet/Mockup mode, you can use the following command:
```bash
> completium-cli switch endpoint

Current network: mockup
Current endpoint: mockup
? Switch endpoint … 
▸ main       https://mainnet-tezos.giganode.io
  main       https://mainnet.smartpy.io
  main       https://rpc.tzbeta.net
  main       https://api.tez.ie/rpc/mainnet
  florence   https://florence-tezos.giganode.io
  florence   https://florencenet.smartpy.io
  granada    https://granada-tezos.giganode.io
  granada    https://granadanet.smartpy.io
  sandbox    http://localhost:20000
  mockup     mockup
```

You can finally run the tests:
```bash
> npm test
```
## How it works
```plantuml
start
if (from in restricted list?) then (yes)
    #pink:error: FROM_RESTRICTED;
    kill
elseif (to in restricted list?) then (yes)
    #pink:error: TO_RESTRICTED;
    kill
elseif (is sender a super user ?) then (yes)
    #palegreen:transfer is valid;
    stop
elseif (is TO transfer list in FROM allowed lists ?) then (yes)
    #palegreen:transfer is valid;
    stop
else (no)
    #pink:error: TO_NOT_ALLOWED;
    kill
@enduml
```

## Model
```plantuml
map users {
 [USER] => [TRANSFER LIST]
 alice => 1
 bob => 2
}

object super_users {
 charly
}

map transfer_lists {
 [ID] => [UNRESTRICTED, ALLOWED_LISTS]
 1 => True, [0,1]
 2 => True, [1,2]
 3 => False, [2]
}
```

## Contract
### Entrypoints
| Method           | Restrictions                    | Parameters                                                                                                                          | Michelson example                                                                                                                                                                                                                               |
|------------------|---------------------------------|-------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| setAdmin        | Only callable by contract owner                            | address                                                                                 | "tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb" |
| addSuperuser             | Only callable by contract owner    | address                                                                          | "tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb"                                                                                                                                                                                     |
| updateUser             | Only callable by contract owner    | (pair (address user) (nat listId))                                                                             | (Pair "tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb" 1)                                                                                                                                                                                     |
| updateUsers        | Only callable by contract owner                            | (list (pair address (option nat)))                                                  | { (Pair "tz1f2GJ6NGePFcKdjNccDWmLJxb1rkJ6uZLe" (Some 0)) ; (Pair "tz1depofsXNUscfZwRx57nsgziafHuGbC8eo" (Some 1)) }                                                                                                                 |
| updateTransferlist   | Only callable by contract owner |  (pair (nat %transferlistId) (option %u (pair bool (set nat))))                                                                                                                               | (Pair (0) (Some (Pair True (set 0))))                                                                          |
| removeSuperuser   | Only callable by contract owner | address                                                                                                                               | "tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb"                                                                          |
| assertReceivers | None | (list address) |   { "tz1depofsXNUscfZwRx57nsgziafHuGbC8eo" ; "tz1TbYXorbD6kX4qW27QJcRFpSxfJA4JWQkR" }                                                    |
| assertTransfers         | None | (list (pair address (list address))) | { (Pair "tz1TbYXorbD6kX4qW27QJcRFpSxfJA4JWQkR" { "tz1depofsXNUscfZwRx57nsgziafHuGbC8eo" }) }                                                                                                                                     |
| assertTransferlist | None  | (pair (nat %fromTransferListId) (nat %toTransferListId)) | (Pair 0 1)                                                                                                                                |

### Storage
| Element           | Type                                 |
|-------------------|--------------------------------------|
| admin             | address                              |
| users     | big_map(address, nat)                              |
| transferlists      | big_map(nat, $transferlists_value)                                  |
| superusers            | set(address)            |

### Types
| Element           | Type                                                            |
|-------------------|-----------------------------------------------------------------|
| $transferlists_value        | pair(unrestricted bool, allowedTransferlists set(nat))|

### Deployments
#### Mainnnet
```
TBD
```
#### Granadanet
```
https://better-call.dev/granadanet/KT1R23DuJRzbPc9VCio9JhcZgaPh44oPHuBA/operations
```
## Test cases
| Entrypoint                 | Test case                                                              | Expected result | Progress |
|--------------------|------------------------------------------------------------------------|-----------------|----------|
| Set admin            |                                                                        |                 |          |
|                    | Set admin as non admin should fail                           | Error: INVALID_CALLER         | ✅ Done   |
|                    | Set admin should succeed                    | Success         | ✅ Done   |
| Add super user   |                                                                        |                 |          |
|                    | Add super user in whitelist contract as non admin should fail                                          | Error: INVALID_CALLER         | ✅ Done   |
|                    | Add super user in whitelist contract as admin should succeed                                            | Success         | ✅ Done   |
|                    | Add an already existing super user in whitelist contract as admin should succeed                                         | Success         | ✅ Done   |
| Update user         |                                                                        |                 |          |
|                    | Update a non existing user in whitelist contract as non admin should fail                                | Error: INVALID_CALLER         | ✅ Done   |
|                    | Update a non existing user in whitelist contract as admin should succeed                                       | Success         | ✅ Done   |
|                    | Update a non existing user in whitelist contract with no whitelist id as admin should succeed                                 | Success         | ✅ Done   |
|                    | Update an existing user in whitelist contract with whitelist id as admin should succeed              | Success         | ✅ Done   |
| Update users           |                                                                        |                 |          |
|                    | Update non existing users in whitelist contract as non admin should fail                                             | Error: INVALID_CALLER         | ✅ Done   |
|                    | Update non existing users in whitelist contract as admin should succeed     | Success         | ✅ Done   |
|                    | Update existing users in whitelist contract as admin should succeed                                        | Success         | ✅ Done   |
| Update transfer list       |                                                                        |                 |          |
|                    | Update non existing transfer list as non admin should fail                                        | Error: INVALID_CALLER         | ✅ Done   |
|                    | Update non existing transfer list as admin should succeed                                      | Success         | ✅ Done   |
|                    | Update non existing transfer list as admin with no allowed lists should succeed                                        | Success         | ✅ Done   |
|                    | Update existing transfer list as admin with no allowed lists should succeed                                        | Success         | ✅ Done   |
|                    | Update existing transfer list as admin should succeed                                        | Success         | ✅ Done   |
|                    | Update existing transfer list with null to delete it as admin should succeed                                        | Success         | ✅ Done   |
| Remove super user |                                                                        |                 |          |
|                    | Remove super user in whitelist contract as non admin should fail                                       | Error: INVALID_CALLER         | ✅ Done   |
|                    | Remove non existing super user from whitelist contract should succeed                                  | Success         | ✅ Done   |
|                    | Remove existing super user from whitelist contract should succeed                                  | Success         | ✅ Done   |
| Assert receivers         |                                                                        |                 |          |
|                    | Assert receivers with only restricted users should fail                                  | Error: USER_RESTRICTED         | ✅ Done   |
|                    | Assert receivers with restricted and non restricted users should fail                                   | Error: USER_RESTRICTED         | ✅ Done   |
|                    | Assert receivers with unknown users should fail             | Error: USER_RESTRICTED         | ✅ Done   |
|                    | Assert receivers with users without allowed list should fail                  | Error: USER_RESTRICTED         | ✅ Done   |
|                    | Assert receivers with unrestricted users should succeed                                 | Success         | ✅ Done   |
| Assert transfers               |                                                                        |                 |          |
|                    | Assert transfers [FROM: restriced, TO: restriced] should fail                                           | Error: FROM_RESTRICTED         | ✅ Done   |
|                    | Assert transfers [FROM: not whitelisted, TO: not whitelisted] should fail                                           | Error: FROM_RESTRICTED         | ✅ Done   |
|                    | Assert transfers [FROM: redtricted, TO: not whitelisted] should fail                                          | Error: FROM_RESTRICTED         | ✅ Done   |
|                    | Assert transfers [FROM: not whitelisted, TO: redtricted] should fail                                          | Error: FROM_RESTRICTED         | ✅ Done   |
|                    | Assert transfers [FROM: whitelisted unrestricted, TO: restricted] should fail                                         | Error: TO_RESTRICTED         | ✅ Done   |
|                    | Assert transfers [FROM: whitelisted unrestricted, TO: not whitelisted] should fail                                         | Error: TO_RESTRICTED         | ✅ Done   |
|                    | Assert transfers [FROM: whitelisted unrestricted, TO: not in FROM allowed list] should fail                                         | Error: TO_RESTRICTED         | ✅ Done   |
|                    | Assert transfers [FROM: whitelisted unrestricted, TO: in FROM allowed list] should succeed                                         | Success         | ✅ Done   |
|                    | Assert transfers [FROM: not whitelisted, TO: not whitelisted, SENDER: SUPERUSER] should fail                                         | Error: FROM_NOT_WHITELISTED         | ✅ Done   |
|                    | Assert transfers [FROM: whitelisted, TO: not whitelisted, SENDER: SUPERUSER] should fail                                         | Error: TO_NOT_WHITELISTED         | ✅ Done   |
|                    | Assert transfers [FROM: restricted, TO: not whitelisted, SENDER: SUPERUSER] should fail                                         | Error: TO_NOT_WHITELISTED         | ✅ Done   |
|                    | Assert transfers [FROM: not whitelisted, TO: restricted, SENDER: SUPERUSER] should fail                                         | Error: FROM_NOT_WHITELISTED         | ✅ Done   |
|                    | Assert transfers [FROM: restricted, TO: not in FROM allowed list, SENDER: SUPERUSER] should fail                                         | Error: FROM_RESTRICTED         | ✅ Done   |
|                    | Assert transfers [FROM: unrestricted, TO: restricted, SENDER: SUPERUSER] should fail                                         | Error: TO_RESTRICTED         | ✅ Done   |
|                    | Assert transfers [FROM: whitelisted unrestricted, TO: in FROM allowed list, , SENDER: SUPERUSER] should succeed                                         | Success         | ✅ Done   |
| Assert transfer list              |                                                                        |                 |          |
|                    | Assert transfer list with non existing from transfer list should fail                                            | Error: FROM_TRANSFERLIST_NOT_FOUND         | ✅ Done   |
|                    | Assert transfer list with non existing to transfer list should fail                                          | Error: TO_TRANSFERLIST_NOT_FOUND         | ✅ Done   |
|                    | Assert transfer list with restricted existing from transfer list should fail                                          | Error: FROM_INVALID_UNRESTRICTED_STATE         | ✅ Done   |
|                    | Assert transfer list with restricted existing to transfer list should fail                                          | Error: TO_INVALID_UNRESTRICTED_STATE         | ✅ Done   |
|                    | Assert transfer list with to transfer list not in from allowed lists should fail                                          | Error: TO_TRANSFERLIST_NOT_FOUND_IN_FROM         | ✅ Done   |
|                    | Assert transfer list with to transfer list  in from allowed lists should succeed                                          | Success         | ✅ Done   |


