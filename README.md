## SKAI UI

SKAI ERP - Enhanced User Interface

### Development
Use [frappe_docker](https://github.com/frappe/frappe_docker/blob/main/docs/development.md) for development.

TLDR:
1. Start docker
2. Open `frappe_docker` repo in VS Code
3. Remote-Containers: Reopen in Container
4. First time - Setup bench, Create new site, Install this app
5. In Subsequent runs: `cd frappe-bench`
6. In terminal, run `bench start`
7. Open [localhost:8000](localhost:8000)
8. Add dependent apps if needed.
  - `bench get-app repo`,  `repo` naming: https://github.com/frappe/bench/blob/v5.x/bench/app.py#L53
  - `bench --site [sitename] install-app repo`
  - Add dependent apps entry under `hooks.py` > `required_apps`
  - Format: `user/repo`, `repo` naming: https://github.com/frappe/bench/blob/v5.x/bench/utils/app.py#L225
9. Once development is complete, push to Github and tag, eg: v1.0.0

### Todo
- Remote Backup and restore
- Remote bench build
- Remote bench migrate (or any bench command?)

#### License

GPL v3.0
