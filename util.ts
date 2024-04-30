interface Token {
    spec: string;
    name: string;
    symbol: string;
    icon: string;
    reference: string;
    reference_hash: string;
    decimals: number;
    id: string;
}

interface ScoredToken {
    token: Token;
    score: number;
}
export const searchToken = async (query: string): Promise<Token[]> => {
    const whitelistMetadata: Record<string, Token> = await Bun.file("./whitelist-fts.json").json();

    if (!whitelistMetadata) {
        return [];
    }

    function normalize(text: string): string {
        return text.toLowerCase().replace(/[^\w\s]/gi, ''); // Remove non-alphanumeric characters except space
    }

    function tokenize(text: string): string[] {
        return normalize(text).split(/\s+/);
    }

    function searchTokens(_query: string): Token[] {
        const query = normalize(_query);

        const queryTokens = tokenize(query);
        const tokenScores: ScoredToken[] = [];

        Object.values(whitelistMetadata).forEach(token => {
            const nameTokens = tokenize(token.name);
            const symbolTokens = tokenize(token.symbol);
            const idTokens = tokenize(token.id);
            let score = 0;

            // console.log({ nameTokens, symbolTokens, idTokens })

            queryTokens.forEach(queryToken => {
                const nameMatches = nameTokens.filter(nameToken => nameToken.includes(queryToken)).length;
                const symbolMatches = symbolTokens.filter(symbolToken => symbolToken.includes(queryToken)).length;
                const idMatches = idTokens.filter(idToken => idToken.includes(queryToken)).length;

                // Weight the matches, potentially giving different weights to different types of matches
                score += nameMatches + symbolMatches * 2 + idMatches * 3; // Example weights: higher weight for ID matches
            });

            if (score > 0) {
                tokenScores.push({ token, score });
            }
        });

        // Sort results by score in descending order and return only the token objects
        return tokenScores.sort((a, b) => b.score - a.score).map(entry => entry.token);
    }

    return searchTokens(query);
}
