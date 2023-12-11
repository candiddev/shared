# Candid Shared Libraries and Tools

> A collection of stuff used by Candid Development

Once upon a time, Candid Development used a monorepo and life was easy.  When we split our monorepo into product specific repos, this shared repository is the junk drawer equivalent of the leftover code.  Other Candid repositories heavily use this via submodule and symlinks.

## License

The code in this repository is licensed under the [GNU AGPL](https://www.gnu.org/licenses/agpl-3.0.en.html).  Please [contact us](mailto:info@candid.dev) for licensing exceptions.

## Development

Our development process is mostly trunk-based with a `main` branch that folks can contribute to using pull requests.  We tag releases as necessary using CalVer.

### Repository Layout

- `./containers:` Files for containers
- `./github:` Reusable GitHub Actions
- `./go:` Go libraries
- `./hugo:` Hugo themes
- `./shell:` Development tooling
- `./web:` Web libraries

### CI/CD

We use GitHub Actions to lint, test, build, release, and deploy the code.  You can view the pipelines in the `.github/workflows` directory.  You should be able to run most workflows locally and validate your code before opening a pull request.

### Tooling

Our tooling should support the following environments:

- darwin/amd64
- darwin/arm64
- linux/amd64
- linux/arm64

#### Containers

We heavily use containers for running and testing.  Our tooling should work with docker and podman.

#### VSCode

We use VSCode for development and have defined settings and extensions in the `.vscode` folder.

#### direnv

We use [direnv](https://direnv.net/) to set various environment variables via the `.envrc` file.  You should use this tool too.

#### m

We use a custom tool for dev environments, `m`, that does various things.  It's basically a collection of bash scripts.  You can view the usage instructions by running `./m`.
