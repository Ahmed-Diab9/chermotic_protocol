import { rest as handler } from 'msw';
import { isNil } from 'ramda';

const currentDate = new Date();

export const handlers = [
  handler.get('/airdrop/accounts', (request, response, context) => {
    const address = request.url.searchParams.get('address');
    if (isNil(address)) {
      return response(
        context.status(404),
        context.body(
          JSON.stringify({ message: 'Address not found', verified: false, address: undefined })
        )
      );
    }
    return response(
      context.status(200),
      context.body(
        JSON.stringify({
          message: 'Address verified.',
          verified: true,
          address,
        })
      )
    );
  }),
  handler.get('/airdrop/assets', (request, response, context) => {
    const address = request.url.searchParams.get('address');
    if (isNil(address)) {
      return response(
        context.status(404),
        context.body(JSON.stringify({ message: 'Address not found' }))
      );
    }

    return response(
      context.status(200),
      context.body(JSON.stringify({ credit: 1000, booster: 10 }))
    );
  }),
  handler.post('/airdrop/assets/sync-zealy', async (request, response, context) => {
    const data = await request.json();
    const { address } = data as { address: `0x${string}` };
    return response(context.status(200), context.body(JSON.stringify({ synced_count: 10 })));
  }),

  handler.get('/airdrop/assets/histories', (request, response, context) => {
    const address = request.url.searchParams.get('address');
    if (isNil(address)) {
      return response(
        context.status(404),
        context.body(JSON.stringify({ message: 'Address not found' }))
      );
    }
    return response(
      context.status(200),
      context.body(
        JSON.stringify([
          {
            id: 1,
            address,
            credit: 100,
            booster: 0,
            activity_type: 'SignInReward' as 'SignInReward' | 'Gleam' | 'Zealy',
            created_at: currentDate.toISOString(),
          },
          {
            id: 2,
            address,
            credit: 0,
            booster: 20,
            activity_type: 'Zealy' as 'SignInReward' | 'Gleam' | 'Zealy',
            created_at: currentDate.toISOString(),
          },
          {
            id: 3,
            address,
            credit: 200,
            booster: 0,
            activity_type: 'Gleam' as 'SignInReward' | 'Gleam' | 'Zealy',
            created_at: currentDate.toISOString(),
          },
        ])
      )
    );
  }),
  handler.get('/airdrop/leaderboard/today', async (request, response, context) => {
    const _page = request.url.searchParams.get('page');
    const _limit = request.url.searchParams.get('limit');
    if (isNil(_page) || isNil(_limit)) {
      return response(
        context.status(404),
        context.body(
          JSON.stringify({
            message: 'Parameters invalid',
          })
        )
      );
    }
    return response(
      context.status(200),
      context.body(
        JSON.stringify({
          participants: 100,
          total_credit: 3000,
          total_booster: 20,
          data: [
            {
              rank: 1,
              address: '0x100',
              credit: 100,
              booster: 1,
            },
            {
              rank: 2,
              address: '0x200',
              credit: 100,
              booster: 2,
            },
            {
              rank: 3,
              address: '0x300',
              credit: 100,
              booster: 3,
            },
            {
              rank: 4,
              address: '0x400',
              credit: 100,
              booster: 4,
            },
            {
              rank: 5,
              address: '0x500',
              credit: 100,
              booster: 5,
            },
            {
              rank: 6,
              address: '0x600',
              credit: 100,
              booster: 6,
            },
          ],
        })
      )
    );
  }),
  handler.get('/airdrop/leaderboard/yesterday', async (request, response, context) => {
    const _page = request.url.searchParams.get('page');
    const _limit = request.url.searchParams.get('limit');
    if (isNil(_page) || isNil(_limit)) {
      return response(
        context.status(404),
        context.body(
          JSON.stringify({
            message: 'Parameters invalid',
          })
        )
      );
    }
    return response(
      context.status(200),
      context.body(
        JSON.stringify({
          participants: 100,
          total_credit: 3000,
          total_booster: 20,
          data: [
            {
              rank: 1,
              address: '0x100',
              credit: 100,
              booster: 1,
            },
            {
              rank: 2,
              address: '0x200',
              credit: 100,
              booster: 2,
            },
            {
              rank: 3,
              address: '0x300',
              credit: 100,
              booster: 3,
            },
            {
              rank: 4,
              address: '0x400',
              credit: 100,
              booster: 4,
            },
            {
              rank: 5,
              address: '0x500',
              credit: 100,
              booster: 5,
            },
            {
              rank: 6,
              address: '0x600',
              credit: 100,
              booster: 6,
            },
          ],
        })
      )
    );
  }),
  handler.get('/airdrop/leaderboard/all', async (request, response, context) => {
    const _page = request.url.searchParams.get('page');
    const _limit = request.url.searchParams.get('limit');
    if (isNil(_page) || isNil(_limit)) {
      return response(
        context.status(404),
        context.body(
          JSON.stringify({
            message: 'Parameters invalid',
          })
        )
      );
    }
    return response(
      context.status(200),
      context.body(
        JSON.stringify({
          participants: 100,
          total_credit: 3000,
          total_booster: 20,
          data: [
            {
              rank: 1,
              address: '0x100',
              credit: 100,
              booster: 1,
            },
            {
              rank: 2,
              address: '0x200',
              credit: 100,
              booster: 2,
            },
            {
              rank: 3,
              address: '0x300',
              credit: 100,
              booster: 3,
            },
            {
              rank: 4,
              address: '0x400',
              credit: 100,
              booster: 4,
            },
            {
              rank: 5,
              address: '0x500',
              credit: 100,
              booster: 5,
            },
            {
              rank: 6,
              address: '0x600',
              credit: 100,
              booster: 6,
            },
          ],
        })
      )
    );
  }),
  handler.post('/airdrop/signin-reward', async (request, response, context) => {
    const data = await request.json();
    const { address, round, date } = data as {
      address: `0x${string}`;
      round: number;
      date: Date;
    };
    return response(
      context.status(200),
      context.body(
        JSON.stringify({
          reward_credit: 11,
          reward_booster: 11,
          total_credit: 50,
          round: round + 1,
        })
      )
    );
  }),
  handler.post('/airdrops/signin-reward/bonus', async (request, response, context) => {
    const data = (await request.json()) as {
      address: `0x${string}`;
      round: number;
      date: Date;
    };
    const { address, round, date } = data;
    return response(
      context.status(200),
      context.body(
        JSON.stringify({
          reward_credit: 21,
          reward_booster: 12,
          total_credit: 50,
          round: round + 1,
        })
      )
    );
  }),
  handler.get('/airdrop/signin-reward/schedules', (request, response, context) => {
    const address = request.url.searchParams.get('address');
    if (isNil(address)) {
      return response(
        context.status(404),
        context.body(JSON.stringify({ message: 'Address not found' }))
      );
    }

    return response(
      context.status(200),
      context.body(
        JSON.stringify([
          {
            date: '2023-10-30T00:00:00.000Z',
            round: 1,
            credit: 10,
            booster: 0,
            created_at: '2023-10-27T01:51:16.292Z',
            attendance: true,
          },
          {
            date: '2023-10-31T00:00:00.000Z',
            round: 1,
            credit: 10,
            booster: 0,
            created_at: '2023-10-27T01:51:16.292Z',
            attendance: false,
          },
          {
            date: '2023-11-01T00:00:00.000Z',
            round: 1,
            credit: 10,
            booster: 0,
            created_at: '2023-10-27T01:51:16.292Z',
            attendance: false,
          },
          {
            date: '2023-11-02T00:00:00.000Z',
            round: 1,
            credit: 10,
            booster: 0,
            created_at: '2023-10-27T01:51:16.292Z',
            attendance: false,
          },
          {
            date: '2023-11-03T00:00:00.000Z',
            round: 1,
            credit: 10,
            booster: 0,
            created_at: '2023-10-27T01:51:16.292Z',
            attendance: false,
          },
          {
            date: '2023-11-04T00:00:00.000Z',
            round: 1,
            credit: 10,
            booster: 0,
            created_at: '2023-10-27T01:51:16.292Z',
            attendance: false,
          },
          {
            date: '2023-11-05T00:00:00.000Z',
            round: 1,
            credit: 10,
            booster: 0,
            created_at: '2023-10-27T01:51:16.292Z',
            attendance: false,
          },
        ])
      )
    );
  }),
];
