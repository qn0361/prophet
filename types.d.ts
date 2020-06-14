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
