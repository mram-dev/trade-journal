#!/usr/bin/env python3
import subprocess, os, json

with open('/home/mram/trade-journal/.cf-token') as f:
    token = f.read().strip()

env = {k: v for k, v in os.environ.items() if 'proxy' not in k.lower()}
env['CLOUDFLARE_API_TOKEN'] = token

# Step 1: Create D1 database
print("=== Creating D1 Database ===")
r = subprocess.run(['npx', 'wrangler', 'd1', 'create', 'trade-journal-db'], cwd='/home/mram/trade-journal', env=env, capture_output=True, text=True, timeout=30)
print(r.stdout)
if r.stderr: print(r.stderr)

# Extract database_id from output
for line in r.stdout.split('\n'):
    if 'database_id' in line:
        db_id = line.split('"')[1] if '"' in line else line.split("'")[1] if "'" in line else ''
        print(f"Database ID: {db_id}")
        # Update wrangler.toml
        if db_id:
            with open('/home/mram/trade-journal/wrangler.toml', 'r') as f:
                content = f.read()
            content = content.replace('YOUR_D1_DATABASE_ID', db_id)
            with open('/home/mram/trade-journal/wrangler.toml', 'w') as f:
                f.write(content)
            print("wrangler.toml updated!")
        break

print(f"Exit: {r.returncode}")
