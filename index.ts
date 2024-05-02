import { ftGetTokenMetadata, init_env, type EstimateSwapView, estimateSwap, fetchAllPools, instantSwap, type Transaction, ftGetTokensMetadata, getTotalPools, getGlobalWhitelist } from "@ref-finance/ref-sdk";
import { Elysia } from "elysia"
import { searchToken } from "./util";

init_env('mainnet');

new Elysia()
    .get("/:token", async ({ params: { token } }) => {
        const _tokenIn = await searchToken(token)
        const tokenMetadata = await ftGetTokenMetadata(_tokenIn[0].id);
        return tokenMetadata;
    })
    // http://localhost:3300/swap/lonk/dragon/1
    .get("/swap/:tokenIn/:tokenOut/:quantity", async ({ params: { tokenIn, tokenOut, quantity }, headers }) => {
        const mbMetadata = JSON.parse(headers["mb-metadata"] || "{}")
        const accountId = mbMetadata?.accountData?.accountId

        const { simplePools } = await fetchAllPools();

        const _tokenIn = await searchToken(tokenIn)
        const _tokenOut = await searchToken(tokenOut)

        if (_tokenIn.length === 0 || _tokenOut.length === 0) {
            return "Token not found"
        }

        const tokenInId = _tokenIn[0]?.id || undefined
        const tokenOutId = _tokenOut[0]?.id || undefined

        if (!tokenInId || !tokenOutId) {
            return "Token not found"
        }

        const tokenInData = await ftGetTokenMetadata(tokenInId);
        const tokenOutData = await ftGetTokenMetadata(tokenOutId);

        const swapTodos: EstimateSwapView[] = await estimateSwap({
            tokenIn: tokenInData,
            tokenOut: tokenOutData,
            amountIn: quantity,
            simplePools,
        });

        const transactionsRef: Transaction[] = await instantSwap({
            tokenIn: tokenInData,
            tokenOut: tokenOutData,
            amountIn: quantity,
            swapTodos,
            slippageTolerance: 0.01,
            AccountId: accountId
        });

        return transactionsRef;
    })
    .get("/spec.json", async () => {
        return Bun.file("spec.json").text();
    })
    .listen(3300)


console.log("Listening on http://localhost:3300")