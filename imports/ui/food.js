import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { Foods } from '../api/foods.js';

import './food.html';

// function for adjusting the size of the edit-food input
function resizeInput() {
  let inputLength = $(this).val().length;
  if (inputLength == 0) {
    inputLength = 1
  }
  $(this).attr('size', inputLength);
};

Template.food.helpers({
  isOwner() {
    return this.owner === Meteor.userId();
  },
  isEaten() {
    // This function should return true if the food template
    // id is in the foodsEaten reactive dictionary
    if (_.contains(Session.get('foodsEaten'), this._id)) {
      return true;
    } else {
      return false;
    }
  },
  isEditing() {
    return Session.equals('foodEditing', this._id);
  },
  isNotEditable() {
    return (!Template.currentData().inBasket &&
            FlowRouter.getRouteName() === "my-meals");
  },
  inMeal() {
    // console.log(Template.currentData());
    return Template.currentData().inMeal;
  },
  editingMeal() {
    const mealId = Template.currentData().mealId;
    return Session.get("editingMeal") === mealId;
  },
  beingRemoved() {
    const mealId = Template.currentData().mealId;
    return (Session.get("editingMeal") === mealId &&
            _.contains(Session.get("foodsRemoved"), this._id));
  },
  foodGestures: {
    'press .food-item' (event, instance) {
      Session.set('foodEditing', instance.data._id)
      instance.$(".edit-food-input")
        .keyup(resizeInput)
        .each(resizeInput);
    },
  }
});

Template.food.events({
  'click .delete'() {
    Meteor.call('foods.remove', this._id);
  },
  'click .toggle-avoid'() {
    Meteor.call('foods.setAvoid', this._id, !this.avoid);
  },
  'click .toggle-eaten'(event, instance) {
    // Pushes food ids into foodsEaten Session variable
    event.preventDefault();
    let eaten = Session.get('foodsEaten');
    const foodId = instance.data._id;

    // Don't push any foodId into foodsEaten if currently editing
    if (Session.equals('foodEditing', foodId)) {
      console.log("Currently editing food item. Do anything with foodEaten");
      return null;
    }
    if (!_.contains(eaten, foodId)) {
      eaten.push(foodId);
    } else {
      eaten = _.without(eaten, foodId);
    }
    console.log("Eaten", eaten);
    Session.set('foodsEaten', eaten);
  },
  'click .remove-food'(event, instance) {
    event.preventDefault();
    let removed = Session.get('foodsRemoved');
    const foodId = instance.data._id;

    // Don't push any foodId into foodsEaten if currently editing
    if (Session.equals('foodEditing', foodId)) {
      console.log("Currently editing food item. Do anything with foodEaten");
      return null;
    }
    if (!_.contains(removed, foodId)) {
      removed.push(foodId);
    } else {
      removed = _.without(removed, foodId);
    }
    console.log("Removed", removed);
    Session.set('foodsRemoved', removed);
  },
  'submit .edit-food'(event, instance) {
    event.preventDefault();
    const originalText = instance.data.text,
          text = event.target.text.value,
          foodId = Template.currentData()._id;
    if (originalText == text) {
      console.log("Edited text is the same! Not making server call");
    } else {
      console.log("Client: text", text);
      Meteor.call('foods.edit', instance.data._id, text, function(err, res) {
        instance.$("#" + foodId).blur();
      })
    }
    Session.set('foodEditing', null);
  },
  'focus .edit-food-input'(event, instance) {
    instance.$(".edit-food-input")
      .keyup(resizeInput)
      .each(resizeInput);
  },
  'blur .edit-food-input'(event, instance) {
    Session.set("foodEditing", null);
  }
});

Template.foodEdit.onRendered(function() {
  const foodId = Template.currentData()._id;
  const instance = Template.instance();
  // console.log("THAT", that);
  instance.autorun(function() {
    if (Session.equals('foodEditing', foodId)) {
      console.log("FOCUS ON THIS:", "#" + foodId);
      Meteor.setTimeout(function() {
        instance.$("#" + foodId).focus();
      }, 500)
    }
  });
});

Template.foodEdit.helpers({
  foodId() {
    return Template.currentData()._id;
  },
  isEditing() {
    return Session.equals('foodEditing', this._id);
  }
})
