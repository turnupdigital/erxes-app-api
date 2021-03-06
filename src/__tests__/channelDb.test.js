/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import toBeType from 'jest-tobetype';
import { connect, disconnect } from '../db/connection';
import { userFactory, integrationFactory, channelFactory } from '../db/factories';
import { Channels, Users, Integrations } from '../db/models';

expect.extend(toBeType);

beforeAll(() => connect());
afterAll(() => disconnect());

describe('test channel creation error', () => {
  test(`check if Error('userId must be supplied') is being thrown as intended`, async () => {
    try {
      Channels.createChannel({
        name: 'Channel test',
      });
    } catch (e) {
      expect(e.message).toBe('userId must be supplied');
    }
  });
});

describe('channel creation', () => {
  let _user;
  let _user2;
  let _integration;

  beforeEach(async () => {
    _user = await userFactory({});
    _integration = await integrationFactory({});
    _user2 = await userFactory({});
  });

  afterEach(async () => {
    await Channels.remove({});
    await Users.remove({});
    await Integrations.remove({});
  });

  test('check if channel is getting created successfully', async () => {
    const doc = {
      name: 'Channel test',
      description: 'test channel descripion',
      memberIds: [_user2._id],
      integrationIds: [_integration._id],
    };

    const channel = await Channels.createChannel(doc, _user._id);

    expect(channel.name).toEqual(doc.name);
    expect(channel.description).toEqual(doc.description);
    expect(channel.memberIds.length).toBe(1);
    expect(channel.integrationIds.length).toEqual(1);
    expect(channel.integrationIds[0]).toEqual(_integration._id);
    expect(channel.userId).toEqual(doc.userId);
    expect(channel.conversationCount).toEqual(0);
    expect(channel.openConversationCount).toEqual(0);
  });
});

describe('channel update', () => {
  let _user;
  let _user2;
  let _integration;
  let _channelDoc;
  let _channel;

  /**
   * Before each test create test data
   * containing 2 users and an integration
   */
  beforeEach(async () => {
    _user = await userFactory({});
    _integration = await integrationFactory({});
    _user2 = await userFactory({});

    _channelDoc = {
      name: 'Channel test',
      description: 'Channel test description',
      userId: _user._id,
      memberIds: [_user2._id],
      integrationIds: [_integration._id],
    };

    _channel = await Channels.createChannel(_channelDoc, _user);
  });

  /**
   * After each test remove the test data
   */
  afterEach(async () => {
    await Channels.remove({});
    await Users.remove({});
    await Integrations.remove({});
  });

  test(`check if Channel update method and
    Channel.preSave filter is working successfully`, async () => {
    // test Channels.createChannel and Channels.preSave =============
    let channel = await Channels.findOne({ _id: _channel._id });

    expect(channel.name).toEqual(_channelDoc.name);
    expect(channel.description).toEqual(_channelDoc.description);
    expect(channel.memberIds.length).toBe(1);
    expect(channel.memberIds[0]).toBe(_user2._id);
    expect(channel.integrationIds.length).toEqual(1);
    expect(channel.integrationIds[0]).toEqual(_integration._id);

    expect(channel.userId).toEqual(_channelDoc.userId);
    expect(channel.conversationCount).toEqual(0);
    expect(channel.openConversationCount).toEqual(0);

    // test Channels.updateChannel and Channels.preSave on update ==========
    _channelDoc.memberIds = [_user._id];

    channel = await Channels.updateChannel(channel._id, _channelDoc);

    expect(channel.memberIds.length).toBe(1);
    expect(channel.memberIds[0]).toBe(_user._id);

    // testing whether the updated field is not overwriting whole document ========
    channel = await Channels.updateChannel(channel._id, {
      name: 'Channel test 2',
    });

    expect(channel.description).toBe('Channel test description');
  });
});

describe('channel remove', () => {
  let _channel;

  beforeEach(async () => {
    const user = await userFactory({});
    _channel = await Channels.createChannel(
      {
        name: 'Channel test',
      },
      user._id,
    );
  });

  afterEach(async () => {
    await Channels.remove({});
  });

  test('check if channel remove method is working successfully', async () => {
    await Channels.removeChannel(_channel._id);

    const channelCount = await Channels.find({}).count();

    expect(channelCount).toBe(0);
  });
});

describe('test createdAtModifier', () => {
  let _channel;

  beforeEach(async () => {
    const user = await userFactory({});
    _channel = await Channels.createChannel(
      {
        name: 'Channel test',
      },
      user._id,
    );
  });

  afterEach(async () => {
    await Channels.remove({});
  });

  test('test whether createdAtModifier is working properly', async () => {
    expect(_channel.createdAt).toBeType('object');

    const createdAt = _channel.createdAt;

    const updatedChannel = await Channels.updateChannel(_channel._id, { name: 'Channel test 2' });

    expect(updatedChannel.createdAt).toEqual(createdAt);
  });
});

describe('db utils', () => {
  let _user;
  let _channel;

  beforeEach(async () => {
    _user = await userFactory({});
    _channel = await channelFactory({ memberIds: ['DFAFDSFDDFAS'] });
  });

  afterEach(async () => {
    await Users.remove({});
    await Channels.remove({});
  });

  test('updateUserChannels', async () => {
    const updatedChannels = await Channels.updateUserChannels([_channel._id], _user._id);

    const updatedChannel = updatedChannels.pop();

    expect(updatedChannel.memberIds).toContain('DFAFDSFDDFAS');
    expect(updatedChannel.memberIds).toContain(_user._id);
  });
});
