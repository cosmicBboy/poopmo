import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import { Foods } from '../api/foods.js';
import { Meals } from '../api/meals.js';

import './mealForm.html';

Template.mealForm.onCreated(function bodyOnCreated() {
  Session.set('foodsEaten', []);
  Meteor.subscribe('meals');
  Meteor.subscribe('foods');
});

Template.mealForm.helpers({
  myFoods() {
    return Foods.find({});
  },
});

Template.mealForm.events({
  'click .submit-new-meal'(event, instance) {
    event.preventDefault();
    const foods = Session.get('foodsEaten');
    const mealType = Session.get('mealType');
    // only call meals.insert if foods Array contains objects
    if (foods.length === 0) {
      console.log('You must check off at least one food!');
    } else if (!mealType) {
      console.log('You must select a meal type!');
    } else {
      Meteor.call('meals.insert', mealType, foods);
      // reset the form
      Session.set('foodsEaten', []);
      instance.$('.meal-type-input').each(function(index) {
      $(this).removeClass('active');
    });
    }
  },
  'click .meal-type-input'(event, instance) {
    event.preventDefault();
    const mealType = event.target.id;
    // add active class to only the meal input type
    // that matches the currect click event id value
    instance.$('.meal-type-input').each(function(index) {
      let $mealType = $(this);
      if ($mealType.attr('id') === mealType) {
        $mealType.addClass('active');
      } else {
        $mealType.removeClass('active');
      }
    });
    Session.set('mealType', mealType);
  }
});
