# GitHub Actions Image Publishing

The workflow at `.github/workflows/publish-api-image.yml` builds and pushes the
CECAE API image to Docker Hub.

## What It Publishes

Image:

```text
brpmx/cecae-api
```

Tags:

- `latest` on pushes to the default branch.
- `sha-<commit>` for every workflow run.
- `vX.Y.Z`, `X.Y.Z`, and `X.Y` when pushing semver tags like `v1.2.3`.

Platform:

- `linux/amd64` for the Ubuntu server and Portainer deployment.

The workflow intentionally does not publish `linux/arm64` so the normal
production image publish stays fast. For local Apple Silicon testing, build
locally with Docker Desktop instead of relying on the published image.

## GitHub Secrets

Create these repository secrets in GitHub:

```text
DOCKERHUB_USERNAME
DOCKERHUB_TOKEN
```

`DOCKERHUB_USERNAME` should be:

```text
brpmx
```

`DOCKERHUB_TOKEN` should be a Docker Hub access token with permission to push to:

```text
brpmx/cecae-api
```

In GitHub:

```text
Repository -> Settings -> Secrets and variables -> Actions -> New repository secret
```

## When It Runs

Automatically:

- On pushes to `main` that touch backend/image files.
- On tags matching `v*`.

Manually:

```text
Actions -> Publish API Image -> Run workflow
```

## Portainer Redeploy Flow

After the workflow succeeds:

1. Open Portainer.
2. Go to the CECAE stack.
3. Click **Pull and redeploy** or **Redeploy** with image pull enabled.
4. Confirm `cecae-migrate-1` exits successfully.
5. Confirm `cecae-api-1` becomes healthy.

The production stack uses:

```env
CECAE_API_IMAGE=brpmx/cecae-api:latest
```

For safer rollbacks, set `CECAE_API_IMAGE` to an immutable SHA tag shown by the
workflow, for example:

```env
CECAE_API_IMAGE=brpmx/cecae-api:sha-abc1234
```
