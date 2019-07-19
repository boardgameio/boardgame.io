#!/bin/bash
# Generates docs/CHANGELOG.md
# Run this right after the npm version command.

CURRENT_TAG=$(git tag | tail -n 1)
PREVIOUS_TAG=$(git tag | tail -n 2 | head -n 1)

FILE=$(mktemp)

echo "## $CURRENT_TAG" >> "$FILE"
echo >> "$FILE"
echo "#### Features" >> "$FILE"
echo >> "$FILE"
echo "#### Bugfixes" >> "$FILE"
echo >> "$FILE"

git log --oneline "$PREVIOUS_TAG".. \
  | sed 's|[[:alnum:]]\+|* [[&](https://github.com/nicolodavis/boardgame.io/commit/&)]|' \
  >> "$FILE"
echo >> "$FILE"

cat docs/documentation/CHANGELOG.md >> "$FILE"
cp "$FILE" docs/documentation/CHANGELOG.md
