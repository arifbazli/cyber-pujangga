#!/usr/bin/env python3
"""
cf-pages-cleanup.py — delete all but the most recent Cloudflare Pages deployment

Internal helper for deploy.sh. Reads API token + project info from env vars,
fetches all deployments via the Cloudflare REST API, and DELETEs each one
except the one with `short_id == KEEP_SHORT_ID`.

Required env vars:
  CLOUDFLARE_API_TOKEN    - Pages:Edit permission token
  CF_ACCOUNT_ID           - Cloudflare account ID (16-char hex)
  CF_PAGES_PROJECT_NAME   - Pages project name (slug)
  KEEP_SHORT_ID           - the short_id (8-hex) of the deployment to preserve

Exit codes:
  0  - success (all old deploys deleted, kept one is intact)
  1  - API/auth failure
  2  - partial failure (some deletes failed; printed to stderr)
"""

import json
import os
import sys
import urllib.request
import urllib.error


def api(method, url, token):
    req = urllib.request.Request(url, method=method)
    req.add_header('Authorization', f'Bearer {token}')
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read().decode()), None
    except urllib.error.HTTPError as e:
        return None, f'HTTP {e.code}: {e.read().decode()[:200]}'
    except (urllib.error.URLError, TimeoutError) as e:
        return None, f'NETWORK: {e}'


def main():
    token      = os.environ.get('CLOUDFLARE_API_TOKEN')
    account    = os.environ.get('CF_ACCOUNT_ID')
    project    = os.environ.get('CF_PAGES_PROJECT_NAME')
    keep_short = os.environ.get('KEEP_SHORT_ID', '')

    missing = [n for n, v in [
        ('CLOUDFLARE_API_TOKEN', token),
        ('CF_ACCOUNT_ID', account),
        ('CF_PAGES_PROJECT_NAME', project),
    ] if not v]
    if missing:
        sys.stderr.write(f'Missing env vars: {", ".join(missing)}\n')
        return 1

    list_url = (
        f'https://api.cloudflare.com/client/v4/accounts/{account}'
        f'/pages/projects/{project}/deployments?page=1'
    )
    data, err = api('GET', list_url, token)
    if err or not data.get('success'):
        sys.stderr.write(f'LIST failed: {err or json.dumps(data)[:200]}\n')
        return 1

    deployments = data.get('result', [])
    sys.stderr.write(f'Found {len(deployments)} deployment(s)\n')

    to_delete = [
        d for d in sorted(deployments, key=lambda x: x['created_on'])
        if d['short_id'] != keep_short
    ]

    if not to_delete:
        sys.stderr.write('Nothing to delete.\n')
        print('0')
        return 0

    deleted = 0
    for d in to_delete:
        del_url = (
            f'https://api.cloudflare.com/client/v4/accounts/{account}'
            f'/pages/projects/{project}/deployments/{d["id"]}'
        )
        body, err = api('DELETE', del_url, token)
        if err or not body.get('success'):
            sys.stderr.write(
                f'  ✗ failed  {d["short_id"]}: {err or json.dumps(body)[:150]}\n'
            )
        else:
            sys.stderr.write(f'  ✓ deleted {d["short_id"]}\n')
            deleted += 1

    sys.stderr.write(f'  → removed {deleted} old deployment(s)\n')
    print(deleted)
    return 2 if deleted < len(to_delete) else 0


if __name__ == '__main__':
    try:
        sys.exit(main())
    except Exception as e:
        sys.stderr.write(f'Fatal: {e}\n')
        sys.exit(1)
