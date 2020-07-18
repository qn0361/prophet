type Clubs = 'clubs';
type Diamonds = 'diamonds';
type Spades = 'spades';
type Hearts = 'hearts';

type Suit = Clubs | Diamonds | Spades | Hearts;
type Quality = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

type Card = {
	quality: Quality,
	suit: Suit,
};

type Hand = [Card, Card];
type Deck = Card[];
type Combo = [Card, Card, Card, Card, Card];
type ComboType = 'kicker' | 'pair' | 'twopairs' | 'set' | 'straight' | 'flush' | 'fullhouse' | 'fourOfKind' | 'straightFlush';
type ComparableCombo = {
	value: number,
	qualities: number[],
};

type Move = {
	type: 'bet' | 'fold';
	value?: number;
};

type Id = string;
type Banks = {[key: string]: number};
type Bets = {[key: string]: number};
type Stacks = {[key: string]: number};
type Hands = {[key: string]: Hand};
type Folders = {[key: string]: boolean};
type Revealed = {[key: string]: boolean};
type Blinds = [number, number];
type PhaseValue = 0 | 1 | 2 | 3 | 4 | 5;
type GameState = {
	// are being updated on every move
	acting: Id,
	active: Id[],
	banks: Banks,
	bets: Bets,
	folders: Folders,
	moves: Move[],
	stacks: Stacks,

	// are being updated on a board update
	deck: Card[],
	board: Card[],
	phase: PhaseValue,

	// are being updated on a round only
	chip: number,
	blinds: Blinds,
	hands: Hands,
	revealed: Revealed,

	// are being updated not so often
	actors: Id[],

	// are not being updated
};

type Dispatch = (move: Move) => void;
type Listener = (state: PublicGameState) => void;
type PublicGameState = Omit<GameState, 'deck'>;

type Game = {
	getState: () => GameState,
	dispatch: Dispatch;
};

type Player = {

};

