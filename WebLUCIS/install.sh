#!/usr/bin/env bash

export LDFLAGS="-L/opt/homebrew/opt/openssl@1.1/lib -L/opt/homebrew/opt/libpq/lib"
export CPPFLAGS="-I/opt/homebrew/opt/openssl@1.1/include -I/opt/homebrew/opt/libpq/include"
export PATH="/Library/PostgreSQL/14/bin:$PATH"
export PATH="/opt/homebrew/opt/libpq/bin:$PATH"