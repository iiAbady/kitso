FROM node:10-alpine AS build
WORKDIR /usr/src/yukikaze
COPY package.json yarn.lock .yarnclean ./
RUN apk add --update \
&& apk add --no-cache ca-certificates \
&& apk add --no-cache --virtual .build-deps git curl build-base python g++ make \
&& yarn install --ignore-engines \
&& apk del .build-deps

FROM node:10-alpine
LABEL name "Kitso"
LABEL version "3.4.0"
LABEL maintainer "Abady <gamersspeaks@gmail.com>"
WORKDIR /usr/src/kitso
COPY --from=build /usr/src/kitso .
COPY . .
RUN yarn build
ENV NODE_ENV= \
	OWNERS= \
	TOKEN= \
	DATABASE_URL= \
	SENTRY= \
    YOUTUBE = \
CMD ["node", "dist/yukikaze.js"]