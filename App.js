import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import * as encoding from 'text-encoding';
import { PrivateKey, ThreadID, Client } from '@textile/hub';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Random from 'expo-random';

const version = 10003 //Math.floor(Math.random() * 1000);
const IDENTITY_KEY = 'identity-' + version
const USER_THREAD_ID = 'user-thread-' + version

const fromRandom = () => {
  const secret = Random.getRandomBytes(32);

  return new PrivateKey(secret, 'ed25519');
};

export const generateIdentity = async () => {
  let idStr = await AsyncStorage.getItem(IDENTITY_KEY);

  if (idStr) {
    return PrivateKey.fromString(idStr);
  }
  const id = fromRandom();
  idStr = id.toString();
  await AsyncStorage.setItem(IDENTITY_KEY, idStr);
  return id;
};

export const cacheUserThread = async (id) => {
  await AsyncStorage.setItem(USER_THREAD_ID, id.toString())
}

export const getCachedUserThread = async () => {
  /**
   * All storage should be scoped to the identity
   *
   * If the identity changes and you try to use an old database,
   * it will error due to not authorized.
   */
  const idStr = await AsyncStorage.getItem(USER_THREAD_ID)
  if (idStr) {
    /**
     * Temporary hack to get ThreadID working in RN
     */
    const id = ThreadID.fromString(idStr)
    return id
  }
  return undefined
}

const getClientToken = async ({ client, id, num = 0 }) => {
  if(num < 10) {
    setTimeout(async () => {
      try {
        await client.getToken(id);
      } catch (e) {
        console.log('30', e);
        await getClientToken({ client, id, num: num + 1 });
      }
    }, 0)
  }
};

export const astronautSchema = {
  $id: 'https://example.com/astronaut.schema.json',
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'Astronauts',
  type: 'object',
  required: ['_id'],
  properties: {
    _id: {
      type: 'string',
      description: "The instance's id.",
    },
    firstName: {
      type: 'string',
      description: "The astronaut's first name.",
    },
    lastName: {
      type: 'string',
      description: "The astronaut's last name.",
    },
    missions: {
      description: 'Missions.',
      type: 'integer',
      minimum: 0,
    },
  },
}

export const createAstronaut = () => {
  return {
    _id: '',
    firstName: 'Buzz',
    lastName: 'Aldrin',
    missions: 2,
  }
}

const setup = async () => {
  const id = await generateIdentity();

  const client = await Client.withKeyInfo({
    key: 'bz4d75ee4jk2suo4v7qqxsohcqu',
    secret: 'bzicbs6mvshjpt77kbycnvh7nnwvio5nvdnjskuq'
  });

  await getClientToken({ client, id });

  // let threadId = await getCachedUserThread()
  // console.log('113', threadId)
  // /**
  //  * Setup a new ThreadID and Database
  //  */
  // if (!threadId) {
  //   threadId = ThreadID.fromRandom()
  //   await cacheUserThread(threadId)
  //   /**
  //    * Each new ThreadID requires a `newDB` call.
  //    */
  //   await client.newDB(threadId)

  //   /**
  //    * We add our first Collection to the DB for Astronauts.
  //    */
  //   await client.newCollection(threadId, { name: 'Astronaut', schema: astronautSchema })
  // }

  /**
   * Update our context with the target threadId.
   */
  // client.context.withThread(threadId.toString());

  // const ids = await client.create(threadId, 'Astronaut', [createAstronaut()]);

  // console.log('122', ids);
};

setup();

export default function App() {
  return (
    <View style={styles.container}>
      <Text>Open up App.js to start working on your app!!!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
