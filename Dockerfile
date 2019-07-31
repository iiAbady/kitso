FROM node:10-alpine
LABEL name "Kitso"
LABEL version "3.4.0"
LABEL maintainer "Abady <gamersspeaks@gmail.com>"
WORKDIR /usr/kitso
COPY src/bot/package.json .yarnclean /usr/yukikaze/src/bot/
COPY tsconfig.json package.json yarn.lock .yarnclean /usr/yukikaze/
RUN apk add --update \
&& apk add --no-cache ca-certificates \
&& apk add --no-cache --virtual .build-deps git curl build-base python g++ make \
&& yarn install --ignore-engines \
&& apk del .build-deps
COPY src/bot /usr/kitso/src/bot/
WORKDIR /usr/kitso/src/bot
RUN yarn build
ENV NODE_ENV= \
	OWNERS= \
	TOKEN= \
	DB= \
	SENTRY= \
CMD ["node", "dist/bot.js"]