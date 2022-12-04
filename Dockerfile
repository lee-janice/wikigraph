# from https://jsramblings.com/dockerizing-a-react-app/
# ==== CONFIGURE ====
# use a Node 18 base image
FROM node:18-alpine
# set the working directory to root
WORKDIR /
# copy app files 
COPY . . 
# ==== BUILD ====
# install dependencies 
RUN npm install
# RUN npm ci 
# build the app 
# RUN npm run build
# === RUN ==== 
# set env to "development"
ENV NODE_ENV development
# expose the port where the app will be running
EXPOSE 3000
# start the app
CMD ["npm", "start"]