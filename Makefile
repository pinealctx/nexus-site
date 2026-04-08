.PHONY: dev build generate lint test clean

dev:
	pnpm dev

build:
	pnpm build

generate:
	pnpm gen

lint:
	pnpm lint

test:
	pnpm vitest --run

clean:
	rm -rf .next out
