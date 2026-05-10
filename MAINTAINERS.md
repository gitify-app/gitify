# Maintainers

Gitify is maintained by a small team. Each forge adapter has at least one designated maintainer responsible for triage, review, and CI for that adapter.

## Core maintainers

- [@setchy](https://github.com/setchy)
- [@afonsojramos](https://github.com/afonsojramos)

## Forge adapter maintainers

| Forge  | Maintainer                                                                             | Source                              |
| ------ | -------------------------------------------------------------------------------------- | ----------------------------------- |
| GitHub | [@setchy](https://github.com/setchy), [@afonsojramos](https://github.com/afonsojramos) | `src/renderer/utils/forges/github/` |
| Gitea  | [@bircni](https://github.com/bircni), [@afonsojramos](https://github.com/afonsojramos) | `src/renderer/utils/forges/gitea/`  |

## Adding a new forge

See [`CONTRIBUTING.md`](./CONTRIBUTING.md#multi-forge-support) for the policy. In short:

1. Open an issue proposing the forge and volunteering as its maintainer.
2. Implement the forge behind the `ForgeAdapter` interface in `src/renderer/utils/forges/<forge-id>/`.
3. Register the adapter in `src/renderer/utils/forges/registry.ts`.
4. Add yourself to the table above and to `CODEOWNERS` for the adapter directory.
