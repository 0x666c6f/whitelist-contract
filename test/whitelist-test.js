const {
    deploy,
    getAccount,
    setQuiet,
    expectToThrow,
    setEndpoint,
} = require('@completium/completium-cli');

const {
    errors
} = require('./utils');

setQuiet("true");

const mockup_mode = false;


// contracts
let whitelist;

// accounts
const superUser = getAccount(mockup_mode ? 'alice' : "alice");
const whitelister = getAccount(mockup_mode ? 'bob' : "bob");
const carl = getAccount(mockup_mode ? 'carl' : "carl");
const daniel = getAccount(mockup_mode ? 'daniel' : "daniel");
const eddy = getAccount(mockup_mode ? 'eddy' : "eddy");
const list0User1 = getAccount(mockup_mode ? 'flo' : "flo");
const list0User2 = getAccount(mockup_mode ? 'gary' : "gary");
const list1User1 = getAccount(mockup_mode ? 'hugo' : "hugo");
const list1User2 = getAccount(mockup_mode ? 'ian' : "ian");
const list2User1 = getAccount(mockup_mode ? 'jacky' : "jacky");

describe("Deploy & init", async () => {
    it("Deploy Whitelist", async () => {
        [whitelist, _] = await deploy('./contract/whitelist.arl', {
            parameters: {
                admin: whitelister.pkh,
            },
            as: whitelister.pkh
        });
    });
});


describe("Set admin", async () => {
    it("Set admin as non admin should fail", async () => {
        await expectToThrow(async () => {
            await whitelist.setAdmin({
                arg: {
                    value: whitelister.pkh
                },
                as: carl.pkh
            });
        }, errors.INVALID_CALLER)
    });

    it("Set admin should succeed", async () => {
        await whitelist.setAdmin({
            arg: {
                value: whitelister.pkh
            },
            as: whitelister.pkh
        });
    });
});

describe("Add super user", async () => {
    it("Add super user in whitelist contract as non admin should fail", async () => {
        await expectToThrow(async () => {
            await whitelist.addSuperuser({
                arg: {
                    user: superUser.pkh,
                },
                as: carl.pkh
            });
        }, errors.INVALID_CALLER)
    });

    it("Add super user in whitelist contract as admin should succeed", async () => {
        await whitelist.addSuperuser({
            arg: {
                user: superUser.pkh,
            },
            as: whitelister.pkh
        });
    });

    it("Add an already existing super user in whitelist contract as admin should succeed", async () => {
        await whitelist.addSuperuser({
            arg: {
                user: superUser.pkh,
            },
            as: whitelister.pkh
        });
    });
});

describe("Update user", async () => {
    it("Update a non existing user in whitelist contract as non admin should fail", async () => {
        await expectToThrow(async () => {
            await whitelist.updateUser({
                arg: {
                    user: list0User1.pkh,
                    transferlistId: 0
                },
                as: carl.pkh
            });
        }, errors.INVALID_CALLER)
    });

    it("Update a non existing user in whitelist contract as admin should succeed", async () => {
        await whitelist.updateUser({
            arg: {
                user: list0User1.pkh,
                transferlistId: 0
            },
            as: whitelister.pkh
        });
    });

    it("Update a non existing user in whitelist contract with no whitelist id as admin should succeed", async () => {
        await whitelist.updateUser({
            arg: {
                user: list0User2.pkh,
                transferlistId: null
            },
            as: whitelister.pkh
        });
    });

    it("Update an existing user in whitelist contract with whitelist id as admin should succeed", async () => {
        await whitelist.updateUser({
            arg: {
                user: list0User2.pkh,
                transferlistId: 0
            },
            as: whitelister.pkh
        });
    });
});

describe("Update users", async () => {

    it("Update non existing users in whitelist contract as non admin should fail", async () => {
        await expectToThrow(async () => {
            await whitelist.updateUsers({
                arg: {
                    utl: [[list1User1.pkh, 1], [list1User2.pkh, null]]
                },
                as: carl.pkh
            });
        }, errors.INVALID_CALLER)
    });

    it("Update non existing users in whitelist contract as admin should succeed", async () => {
        await whitelist.updateUsers({
            arg: {
                utl: [[list1User1.pkh, 0], [list1User2.pkh, null]]
            },
            as: whitelister.pkh
        });
    });

    it("Update existing users in whitelist contract as admin should succeed", async () => {
        await whitelist.updateUsers({
            arg: {
                utl: [[list1User1.pkh, 1], [list1User2.pkh, 1]]
            },
            as: whitelister.pkh
        });
    });
});

describe("Update transfer list", async () => {
    it("Update non existing transfer list as non admin should fail", async () => {
        await expectToThrow(async () => {
            await whitelist.updateTransferlist({
                arg: {
                    transferlistId: 0,
                    u: [true, [0]]
                },
                as: carl.pkh
            });
        }, errors.INVALID_CALLER)
    });

    it("Update non existing transfer list as admin should succeed", async () => {
        await whitelist.updateTransferlist({
            arg: {
                transferlistId: 0,
                u: [false, [0, 2, 3]]
            },
            as: whitelister.pkh
        });
    });

    it("Update non existing transfer list as admin with no allowed lists should succeed", async () => {
        await whitelist.updateTransferlist({
            arg: {
                transferlistId: 1,
                u: [true, []]
            },
            as: whitelister.pkh
        });
    });

    it("Update existing transfer list as admin with no allowed lists should succeed", async () => {
        await whitelist.updateTransferlist({
            arg: {
                transferlistId: 0,
                u: [true, []]
            },
            as: whitelister.pkh
        });
    });

    it("Update existing transfer list as admin should succeed", async () => {
        await whitelist.updateTransferlist({
            arg: {
                transferlistId: 1,
                u: [true, [0]]
            },
            as: whitelister.pkh
        });
    });
});

describe("Remove super user", async () => {

    it("Remove super user in whitelist contract as non admin should fail", async () => {
        await expectToThrow(async () => {
            await whitelist.removeSuperuser({
                arg: {
                    user: superUser.pkh,
                },
                as: carl.pkh
            });
        }, errors.INVALID_CALLER)
    });

    it("Remove non existing super user from whitelist contract should succeed", async () => {
        await whitelist.removeSuperuser({
            arg: {
                user: carl.pkh,
            },
            as: whitelister.pkh
        });
    });

    it("Remove existing super user from whitelist contract should succeed", async () => {
        await whitelist.removeSuperuser({
            arg: {
                user: superUser.pkh,
            },
            as: whitelister.pkh
        });
        await whitelist.addSuperuser({
            arg: {
                user: superUser.pkh,
            },
            as: whitelister.pkh
        });
    });
});

describe("Assert receivers", async () => {
    it("Set up users for assert receivers tests", async () => {
        await whitelist.updateTransferlist({
            arg: {
                transferlistId: 2,
                u: [false, []]
            },
            as: whitelister.pkh
        });
        await whitelist.updateUsers({
            arg: {
                utl: [[list2User1.pkh, 2], [carl.pkh, 2], [list1User1.pkh, null]]
            },
            as: whitelister.pkh
        });
    });

    it("Assert receivers with only restricted users should fail", async () => {
        await expectToThrow(async () => {
            await whitelist.assertReceivers({
                arg: {
                    addrs: [list2User1.pkh, carl.pkh]
                },
                as: whitelister.pkh
            });
        }, errors.USER_RESTRICTED)
    });

    it("Assert receivers with restricted and non restricted users should fail", async () => {
        await expectToThrow(async () => {
            await whitelist.assertReceivers({
                arg: {
                    addrs: [carl.pkh, list1User1.pkh]
                },
                as: whitelister.pkh
            });
        }, errors.USER_RESTRICTED)
    });

    it("Assert receivers with unknown users should fail", async () => {
        await expectToThrow(async () => {
            await whitelist.assertReceivers({
                arg: {
                    addrs: [whitelister.pkh]
                },
                as: whitelister.pkh
            });
        }, errors.USER_RESTRICTED)
    });

    it("Assert receivers with users without allowed list should fail", async () => {
        await expectToThrow(async () => {
            await whitelist.assertReceivers({
                arg: {
                    addrs: [list1User1.pkh]
                },
                as: whitelister.pkh
            });
        }, errors.USER_RESTRICTED)
    });

    it("Assert receivers with unrestricted users should succeed", async () => {
        await whitelist.assertReceivers({
            arg: {
                addrs: [list0User2.pkh, list0User1.pkh]
            },
            as: whitelister.pkh
        });
    });
});

describe("Assert transfers", async () => {
    it("Assert transfers [FROM: restriced, TO: restriced] should fail", async () => {
        await expectToThrow(async () => {
            await whitelist.assertTransfers({
                arg: {
                    input_list: [[carl.pkh, [list2User1.pkh]]]
                },
                as: whitelister.pkh
            });
        }, errors.FROM_RESTRICTED)
    });

    it("Assert transfers [FROM: not whitelisted, TO: not whitelisted] should fail", async () => {
        await expectToThrow(async () => {
            await whitelist.assertTransfers({
                arg: {
                    input_list: [[daniel.pkh, [eddy.pkh]]]
                },
                as: whitelister.pkh
            });
        }, errors.FROM_RESTRICTED)
    });

    it("Assert transfers [FROM: restricted, TO: not whitelisted] should fail", async () => {
        await expectToThrow(async () => {
            await whitelist.assertTransfers({
                arg: {
                    input_list: [[carl.pkh, [eddy.pkh]]]
                },
                as: whitelister.pkh
            });
        }, errors.FROM_RESTRICTED)
    });

    it("Assert transfers [FROM: not whitelisted, TO: restricted] should fail", async () => {
        await expectToThrow(async () => {
            await whitelist.assertTransfers({
                arg: {
                    input_list: [[eddy.pkh, [carl.pkh]]]
                },
                as: whitelister.pkh
            });
        }, errors.FROM_RESTRICTED)
    });

    it("Assert transfers [FROM: whitelisted unrestricted, TO: restricted] should fail", async () => {
        await expectToThrow(async () => {
            await whitelist.assertTransfers({
                arg: {
                    input_list: [[list0User1.pkh, [carl.pkh]]]
                },
                as: whitelister.pkh
            });
        }, errors.TO_RESTRICTED)
    });

    it("Assert transfers [FROM: whitelisted unrestricted, TO: not whitelisted] should fail", async () => {
        await expectToThrow(async () => {
            await whitelist.assertTransfers({
                arg: {
                    input_list: [[list0User1.pkh, [eddy.pkh]]]
                },
                as: whitelister.pkh
            });
        }, errors.TO_RESTRICTED)
    });

    it("Assert transfers [FROM: whitelisted unrestricted, TO: not in FROM allowed list] should fail", async () => {
        await expectToThrow(async () => {
            await whitelist.assertTransfers({
                arg: {
                    input_list: [[list1User2.pkh, [list1User2.pkh]]]
                },
                as: whitelister.pkh
            });
        }, errors.TO_NOT_ALLOWED)
    });

    it("Assert transfers [FROM: whitelisted unrestricted, TO: in FROM allowed list] should succeed", async () => {
        await whitelist.assertTransfers({
            arg: {
                input_list: [[list1User2.pkh, [list0User2.pkh]]]
            },
            as: whitelister.pkh
        });
    });

    it("Assert transfers [FROM: not whitelisted, TO: not whitelisted, SENDER: SUPERUSER] should fail", async () => {
        await expectToThrow(async () => {
            await whitelist.assertTransfers({
                arg: {
                    input_list: [[daniel.pkh, [eddy.pkh]]]
                },
                as: superUser.pkh
            });
        }, errors.FROM_NOT_WHITELISTED)
    });

    it("Assert transfers [FROM: whitelisted, TO: not whitelisted, SENDER: SUPERUSER] should fail", async () => {
        await expectToThrow(async () => {
            await whitelist.assertTransfers({
                arg: {
                    input_list: [[list1User2.pkh, [eddy.pkh]]]
                },
                as: superUser.pkh
            });
        }, errors.TO_NOT_WHITELISTED)
    });

    it("Assert transfers [FROM: restricted, TO: not whitelisted, SENDER: SUPERUSER] should fail", async () => {
        await expectToThrow(async () => {
            await whitelist.assertTransfers({
                arg: {
                    input_list: [[carl.pkh, [eddy.pkh]]]
                },
                as: superUser.pkh
            });
        }, errors.TO_NOT_WHITELISTED)
    });

    it("Assert transfers [FROM: not whitelisted, TO: restricted, SENDER: SUPERUSER] should fail", async () => {
        await expectToThrow(async () => {
            await whitelist.assertTransfers({
                arg: {
                    input_list: [[eddy.pkh, [carl.pkh]]]
                },
                as: superUser.pkh
            });
        }, errors.FROM_NOT_WHITELISTED)
    });

    it("Assert transfers [FROM: unrestricted, TO: not in FROM allowed list, SENDER: SUPERUSER] should succeed", async () => {
        await expectToThrow(async () => {
            await whitelist.assertTransfers({
                arg: {
                    input_list: [[carl.pkh, [list1User2.pkh]]]
                },
                as: superUser.pkh
            });
        }, errors.FROM_RESTRICTED)
    });

    it("Assert transfers [FROM: unrestricted, TO: restricted, SENDER: SUPERUSER] should succeed", async () => {
        await expectToThrow(async () => {
            await whitelist.assertTransfers({
                arg: {
                    input_list: [[list1User2.pkh, [carl.pkh]]]
                },
                as: superUser.pkh
            });
        }, errors.TO_RESTRICTED)

    });

    it("Assert transfers [FROM: whitelisted unrestricted, TO: in FROM allowed list, , SENDER: SUPERUSER] should succeed", async () => {
        await whitelist.assertTransfers({
            arg: {
                input_list: [[list1User2.pkh, [list0User2.pkh]]]
            },
            as: superUser.pkh
        });
    });
});

describe("Assert transfer list", async () => {
    it("Assert transfer list with non existing from transfer list should fail", async () => {
        await expectToThrow(async () => {
            await whitelist.assertTransferlist({
                arg: {
                    fromTransferListId: 666,
                    toTransferListId: 1
                },
                as: whitelister.pkh
            });
        }, errors.FROM_TRANSFERLIST_NOT_FOUND)
    });

    it("Assert transfer list with non existing to transfer list should fail", async () => {
        await expectToThrow(async () => {
            await whitelist.assertTransferlist({
                arg: {
                    fromTransferListId: 1,
                    toTransferListId: 666
                },
                as: whitelister.pkh
            });
        }, errors.TO_TRANSFERLIST_NOT_FOUND)
    });

    it("Assert transfer list with restricted existing from transfer list should fail", async () => {
        await expectToThrow(async () => {
            await whitelist.assertTransferlist({
                arg: {
                    fromTransferListId: 2,
                    toTransferListId: 1
                },
                as: whitelister.pkh
            });
        }, errors.FROM_INVALID_UNRESTRICTED_STATE)
    });

    it("Assert transfer list with restricted existing to transfer list should fail", async () => {
        await expectToThrow(async () => {
            await whitelist.assertTransferlist({
                arg: {
                    fromTransferListId: 1,
                    toTransferListId: 2
                },
                as: whitelister.pkh
            });
        }, errors.TO_INVALID_UNRESTRICTED_STATE)
    });

    it("Assert transfer list with to transfer list not in from allowed lists should fail", async () => {
        await expectToThrow(async () => {
            await whitelist.assertTransferlist({
                arg: {
                    fromTransferListId: 1,
                    toTransferListId: 1
                },
                as: whitelister.pkh
            });
        }, errors.TO_TRANSFERLIST_NOT_FOUND_IN_FROM)
    });

    it("Assert transfer list with to transfer list  in from allowed lists should succeed", async () => {
        await whitelist.assertTransferlist({
            arg: {
                fromTransferListId: 1,
                toTransferListId: 0
            },
            as: whitelister.pkh
        });
    });
});
