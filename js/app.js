import Vue from 'vue';
import VueRouter from 'vue-router';

// Import the components
import ProjectPage from './project/ProjectHeader.vue'; // Import ProjectPage component

// Register Vue Router as a plugin
Vue.use(VueRouter);

// Define the routes for your application
const routes = [
  { path: '/', component: HomePage },  // Home page route
  { path: '/projects', component: ProjectPage },  // Project page route
];

// Create a router instance with the defined routes
const router = new VueRouter({
  routes,
});

// Create and mount the Vue instance
new Vue({
  el: '#app',
  router,  // Attach the router to the Vue instance
});
