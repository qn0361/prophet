import { share } from "../game";
import { expect } from "chai";
import "mocha";

describe("share function", () => {
  it("should handle situation with the only left player", () => {
    const input = {
      hands: {
        "1": [
          { suit: "clubs", quality: "2" },
          { suit: "diamonds", quality: "7" },
        ],
        "2": [
          { suit: "spades", quality: "Q" },
          { suit: "diamonds", quality: "Q" },
        ],
      },
      banks: {
        "1": 200,
        "2": 200,
      },
      board: [
        { suit: "spades", quality: "K" },
        { suit: "diamonds", quality: "K" },
        { suit: "clubs", quality: "K" },
        { suit: "hearts", quality: "K" },
        { suit: "hearts", quality: "A" },
      ],
      folders: {
        "1": true,
      },
    };
    const output = {
      "1": 0,
      "2": 400,
    };

    expect(share(input)).to.deep.equal(output);
  });

  it("should handle situtation with multiple winners", () => {
    const input = {
      hands: {
        "1": [
          { suit: "clubs", quality: "2" },
          { suit: "diamonds", quality: "7" },
        ],
        "2": [
          { suit: "spades", quality: "Q" },
          { suit: "diamonds", quality: "Q" },
        ],
      },
      banks: {
        "1": 200,
        "2": 200,
      },
      board: [
        { suit: "spades", quality: "K" },
        { suit: "diamonds", quality: "K" },
        { suit: "clubs", quality: "K" },
        { suit: "hearts", quality: "K" },
        { suit: "hearts", quality: "A" },
      ],
      folders: {},
    };
    const output = {
      "1": 200,
      "2": 200,
    };

    expect(share(input)).to.deep.equal(output);
  });

  it("should handle all-ins and folders", () => {
    const input = {
      hands: {
        "1": [
          { suit: "clubs", quality: "2" },
          { suit: "diamonds", quality: "7" },
        ],
        "2": [
          { suit: "spades", quality: "Q" },
          { suit: "diamonds", quality: "2" },
        ],
        "3": [
          { suit: "spades", quality: "3" },
          { suit: "diamonds", quality: "3" },
        ],
      },
      banks: {
        "1": 200,
        "2": 400,
        "3": 50,
      },
      board: [
        { suit: "spades", quality: "K" },
        { suit: "diamonds", quality: "K" },
        { suit: "clubs", quality: "K" },
        { suit: "hearts", quality: "7" },
        { suit: "hearts", quality: "A" },
      ],
      folders: {
        "3": true,
      },
    };
    const output = {
      "1": 450,
      "2": 200,
      "3": 0,
    };

    expect(share(input)).to.deep.equal(output);
  });

  it("should give all banks to one person if others are folded", () => {
    const input = {
      hands: {
        "1": [
          { suit: "clubs", quality: "2" },
          { suit: "diamonds", quality: "7" },
        ],
        "2": [
          { suit: "spades", quality: "Q" },
          { suit: "diamonds", quality: "2" },
        ],
        "3": [
          { suit: "spades", quality: "3" },
          { suit: "diamonds", quality: "3" },
        ],
      },
      banks: {
        "1": 200,
        "2": 400,
        "3": 50,
      },
      board: [
        { suit: "spades", quality: "K" },
        { suit: "diamonds", quality: "K" },
        { suit: "clubs", quality: "K" },
        { suit: "hearts", quality: "7" },
        { suit: "hearts", quality: "A" },
      ],
      folders: {
        "1": true,
        "3": true,
      },
    };

    const output = {
      "1": 0,
      "2": 650,
      "3": 0
    };

    expect(share(input)).to.deep.equal(output);
  });

  it('should divide folder\'s bank between winners', () => {
    const input = {
      "hands": {
        "1": [
          {"suit": "clubs", "quality": "2"},
          {"suit": "diamonds", "quality": "7"}
        ],
        "2": [
          {"suit": "spades", "quality": "Q"},
          {"suit": "diamonds", "quality": "2"}
        ],
        "3": [
          {"suit": "spades", "quality": "3"},
          {"suit": "diamonds", "quality": "8"}
        ]
      },
      "banks": {
        "1": 200,
        "2": 400,
        "3": 50
      },
      "board": [
        {"suit": "spades", "quality": "K"},
        {"suit": "diamonds", "quality": "K"},
        {"suit": "clubs", "quality": "K"},
        {"suit": "hearts", "quality": "2"},
        {"suit": "hearts", "quality": "A"},
      ],
      "folders": {
      }
    };
    const output = {
      "1": 225,
      "2": 425,
      "3": 0
    };

    expect(share(input)).to.deep.equal(output);
  });
});
