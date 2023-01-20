import get from 'lodash/get';
import omit from 'lodash/omit';
import { assert, object, string, Describe } from 'superstruct';
import { ContractAddress, TezosAddress, IsoDateString, PositiveInteger, PgBigInt } from '../../../lib/validators';
import { TransactionHandler, TokenEvent, Transaction } from '../../../types';
import { createEventId } from '../../../lib/utils';
import { EIGHTBIDOU_24X24_COLOR_CONTRACT_MARKETPLACE } from '../../../consts';

export const EVENT_TYPE_8BID_24X24_COLOR_SWAP = '8BID_24X24_COLOR_SWAP';

export interface EightbidSwap24x24ColorEvent extends TokenEvent {
  type: typeof EVENT_TYPE_8BID_24X24_COLOR_SWAP;
  seller_address: string;
  artist_address: string;
  swap_id: string;
  price: string;
  amount: string;
  royalties: string;
}

const EightbidSwap24x24ColorSchema: Describe<Omit<EightbidSwap24x24ColorEvent, 'type'>> = object({
  id: string(),
  opid: PgBigInt,
  timestamp: IsoDateString,
  level: PositiveInteger,
  fa2_address: ContractAddress,
  token_id: string(),
  ophash: string(),

  artist_address: TezosAddress,
  seller_address: TezosAddress,
  swap_id: PgBigInt,
  price: PgBigInt,
  royalties: PgBigInt,
  amount: PgBigInt,
});

const EightbidSwap8x8ColorHandler: TransactionHandler<EightbidSwap24x24ColorEvent> = {
  source: 'transaction',

  type: EVENT_TYPE_8BID_24X24_COLOR_SWAP,

  description: `A 24x24 color token was swapped on 8bidou.`,

  accept: {
    entrypoint: 'swap',
    target_address: EIGHTBIDOU_24X24_COLOR_CONTRACT_MARKETPLACE,
  },

  exec: (transaction) => {
    const swapId = get(transaction, 'storage.swap_id_count');
    const fa2Address = get(transaction, 'parameter.value.nft_contract_address');
    const sellerAddress = get(transaction, 'sender.address');
    const tokenId = get(transaction, 'parameter.value.nft_id');
    const price = get(transaction, 'parameter.value.payment');
    const royalties = String(Math.floor((1 / parseInt(get(transaction, 'parameter.value.royalties'), 10)) * 1000));
    const amount = get(transaction, 'parameter.value.nft_total_amount');
    const artistAddress = get(transaction, 'parameter.value.creator');
    const id = createEventId(EVENT_TYPE_8BID_24X24_COLOR_SWAP, transaction);

    const event: EightbidSwap24x24ColorEvent = {
      id,
      type: EVENT_TYPE_8BID_24X24_COLOR_SWAP,
      opid: String(transaction.id),
      ophash: transaction.hash,
      timestamp: transaction.timestamp,
      level: transaction.level,
      fa2_address: fa2Address,
      token_id: tokenId,

      seller_address: sellerAddress,
      artist_address: artistAddress,
      swap_id: swapId,
      price: price,
      royalties: royalties,
      amount: amount,
    };

    assert(omit(event, ['type']), EightbidSwap24x24ColorSchema);

    return event;
  },
};

export default EightbidSwap8x8ColorHandler;
