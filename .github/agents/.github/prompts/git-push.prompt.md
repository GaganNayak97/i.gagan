---
name: git-push
description: Commit and push latest project changes
agent: agent
---
Generate a new issue template for a GitHub repository.
Push the latest changes of the current Git repository.

Steps:
1. Check git status.
2. Stage all changed files.
3. If there are changes to commit, commit them with message "latest changes".
4. Push the current branch to its existing remote.
5. Never use force push.
6. Never change branches.
7. If push is rejected or there is a conflict, stop and tell me the problem.