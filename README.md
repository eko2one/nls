# nostr link shortener
A simple link shortener web application built on top of nostr.

## Sequence Diagram

 ┌──────┐             ┌─────┐                     ┌──────┐    ┌────────────────┐
 │Client│             │Relay│                     │Server│    │Payment Provider│
 └──┬───┘             └──┬──┘                     └──┬───┘    └───────┬────────┘
    │                    │                           │                │
    │PublishEventTarget()│                           │                │
    │───────────────────>│                           │                │
    │                    │                           │                │
    │               SendEventTarget()                │                │
    │───────────────────────────────────────────────>│                │
    │                    │                           │                │
    │                    │     ReadEventTarget()     │                │
    │                    │<──────────────────────────│                │
    │                    │                           │                │
    │                    │                           │CreatePayment() │
    │                    │                           │───────────────>│
    │                    │                           │                │
    │                    │   PublishEventInvoice()   │                │
    │                    │<──────────────────────────│                │
    │                    │                           │                │
    │ ReadEventInvoice() │                           │                │
    │───────────────────>│                           │                │
    │                    │                           │                │
    │              ListenPaymentState()              │                │
    │───────────────────────────────────────────────>│                │
    │                    │                           │                │
    │                    │   ProcessPayment()        │                │
    │────────────────────────────────────────────────────────────────>│
    │                    │                           │                │
    │                    │                           │ConfirmPayment()│
    │                    │                           │<───────────────│
    │                    │                           │                │
    │                    │ replaceEventInvoice(paid) │                │
    │                    │<──────────────────────────│                │
    │                    │                           │                │
    │              CreateEventAnchor()               │                │
    │<───────────────────────────────────────────────│                │
    │                    │                           │                │
    │PublishEventAnchor()│                           │                │
    │───────────────────>│                           │                │
    │                    │                           │                │
    │                    │     ReadEventAnchor()     │                │
    │                    │<──────────────────────────│                │
    │                    │                           │                │
    │                    │replaceEventInvoice(anchor)│                │
    │                    │<──────────────────────────│                │
 ┌──┴───┐             ┌──┴──┐                     ┌──┴───┐    ┌───────┴────────┐
 │Client│             │Relay│                     │Server│    │Payment Provider│
 └──────┘             └─────┘                     └──────┘    └────────────────┘


## Setup
Clone the repo and cd into the directory:

```bash
$ yarn
$ yarn dev
```



## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).

## Type Support For `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin) to make the TypeScript language service aware of `.vue` types.

If the standalone TypeScript plugin doesn't feel fast enough to you, Volar has also implemented a [Take Over Mode](https://github.com/johnsoncodehk/volar/discussions/471#discussioncomment-1361669) that is more performant. You can enable it by the following steps:

1. Disable the built-in TypeScript Extension
   1. Run `Extensions: Show Built-in Extensions` from VSCode's command palette
   2. Find `TypeScript and JavaScript Language Features`, right click and select `Disable (Workspace)`
2. Reload the VSCode window by running `Developer: Reload Window` from the command palette.
