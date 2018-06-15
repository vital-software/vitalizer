FROM node:8

# Set timezone
ENV TZ=Pacific/Auckland

# Add npm-auth-env helper
RUN echo -e "#/bin/bash\necho \"//registry.npmjs.org/:_authToken=\\\${NPM_TOKEN}\" > /vitalizer/.npmrc" > /usr/local/bin/npm-auth-env && \
    chmod +x /usr/local/bin/npm-auth-env

RUN mkdir -p /vitalizer
WORKDIR /vitalizer
ENV PATH=./node_modules/.bin:$PATH

ADD package.json yarn.lock /vitalizer/
RUN yarn install

ADD . /vitalizer
