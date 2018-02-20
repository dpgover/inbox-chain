const assert = require('assert');
const Web3 = require('web3');
const { interface, bytecode } = require('../compile');

const provider = new Web3.providers.HttpProvider('http://ganache:8545');
const web3 = new Web3(provider);

const INITIAL_MESSAGE = 'Primer Mensajeeee';
let coinbase;
let contract;

beforeEach(async () => {
  // Get the coinbase
  coinbase = await web3.eth.getCoinbase();

  // Deploy the contract
  contract = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({
      data: bytecode,
      arguments: [INITIAL_MESSAGE],
    })
    .send({
      from: coinbase,
      gas: 1000000,
    });

  contract.setProvider(provider);
});

describe('Inbox', () => {
  it('Should be deployed', () => {
    // Address should not be null or undefined
    assert.ok(contract.options.address);
  });

  it('Should be initialized with a message', async () => {
    const message = await contract.methods.message().call();
    assert.equal(message, INITIAL_MESSAGE, `Initial message should be "${INITIAL_MESSAGE}"`);
  });

  it('Should update the message', async () => {
    const newMessage = 'New Message';

    await contract.methods.setMessage(newMessage).send({
      from: coinbase,
      gas: 5000000,
    });
    const message = await contract.methods.message().call();

    assert.equal(message, newMessage, `Updated message shouls be "${newMessage}"`);
  });
});
