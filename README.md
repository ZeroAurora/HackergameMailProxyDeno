# 缝缝补补又一年

今年依然是我负责 Hackergame 的协办工作，但是我已经完全懒得重写一份邮件网关了，于是便沿用了去年的 Deno 代码。

一年过去，Deno 改变了不少，最直观的感觉就是，在 Bun 的高速发展和对比下，Deno 已经无力支撑先前的“独立生态”，转而开始委曲求全地寻求完善 Node.js 兼容性。另一个事情是，他们一年前还在官网首页上强推 Deploy，而现在再看，他们还是把这个“本应成为附属”的产品放在了页面的底部。看上去，应该是吃了不少苦头。

Deno 曾是我最看好的 Server-side JavaScript 运行环境，这在于其完善的、开箱即用的 TypeScript 支持，在于其与浏览器环境的 Web API 广泛通用性（Let's say WinterCG），更在于其远胜其他运行时（Node.js 和 Bun）的工具链集成。Deno 诞生时，我暗中感叹：这家伙真的很像 Go，或许真的能够带动一波迁移狂热。遗憾的是，风风火火了一阵子之后，Deno 终于还是成为了一个四不像。

听说他们又搞了个一个中心化的 [jsr.io](https://jsr.io/)，说是一个统一的 JS 包仓库，不再使用 HTTP 直链导入的方式，并且把旧有的 stdlib 全部迁移到了上面。然而使用直链导入方式的 `deno.land/x` 还在为了兼容性运营着。历史终究证明了 HTTP 直链导入 ESM 并不适合 Server-side JavaScript。这或许是 Deno 最令人恶心，也最令人遗憾的历史遗留吧。

旧的 README 可以在 [这里](/README-old.md) 阅读。

## LICENSE

WTFPL
