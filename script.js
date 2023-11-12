import lessons from './lessons.js';

new Vue({
el: "#app",

data: {
  searchText: "",
  sortBy: "subject",
  orderBy: "asc",
  sortOptions: ["subject", "location", "price", "availability"],
  orders: [
    {
      text: "Ascending",
      value: "asc",
    },
    {
      text: "Descending",
      value: "desc",
    },
  ],
  cart: [],
  isCartDisplaying: false,
  checkedOut: false,
  checkoutForm: {
    name: {
      value: "",
      error: "",
    },
    phone: {
      value: "",
      error: "",
    },
  },
  lessons,
},

methods: {
  updateLessonSpaces(type, id) {
    console.log("in here");
    switch (type) {
      case "decrease":
        this.lessons = this.lessons.map((item) => {
          if (item.id === id && item.spaces > 0)
            return { ...item, spaces: --item.spaces };

          return item;
        });
        break;

      case "reset":
        this.lessons = this.lessons.map((item) => {
          if (item.id === id) return { ...item, spaces: 5 };

          return item;
        });
        break;

      default:
        break;
    }
  },
  isItemInCart(id) {
    return !!this.cart.find((item) => item.id === id);
  },
  addToCart(id) {
    const lesson = this.lessons.find((lesson) => lesson.id === id);

    if (!this.isItemInCart(lesson.id)) {
      this.cart.push({
        ...lesson,
        spaces: 1,
      });
    } else {
      if (lesson.spaces > 0) {
        this.cart = this.cart.map((item) => {
          if (item.id === id) return { ...item, spaces: ++item.spaces };
          return item;
        });
      }
    }

    this.updateLessonSpaces("decrease", lesson.id);
  },
  removeFromCart(id) {
    const index = this.cart.findIndex((item) => item.id === id);
    this.cart.splice(index, 1);
    this.updateLessonSpaces("reset", id);
    if (!this.cart.length) this.toggleCartDisplay();
  },
  toggleCartDisplay() {
    this.isCartDisplaying = !this.isCartDisplaying;
  },
  checkout() {
    this.checkedOut = true;

    this.toggleCartDisplay();

    this.cart.forEach((item) =>
      this.updateLessonSpaces("reset", item.id)
    );

    this.cart = [];

    Object.keys(this.checkoutForm).every(
      (key) => (this.checkoutForm[key].value = "")
    );

    setTimeout(() => {
      this.checkedOut = false;
    }, 3000);
  },
  showAlert: function() {
    alert('Order has been Submitted!');
  }
},

computed: {
  cartLength() {
    if (this.cart.length > 0)
      return this.cart.reduce((total, item) => total + item.spaces, 0);
    return 0;
  },
  filteredLessons() {
    const lessons = this.lessons.filter(
      (lesson) =>
        lesson.subject
          .toLowerCase()
          .includes(this.searchText.toLowerCase()) ||
        lesson.location
          .toLowerCase()
          .includes(this.searchText.toLowerCase())
    );

    if (this.orderBy === "asc") {
      switch (this.sortBy) {
        case "subject":
          return lessons.sort((a, b) => {
            if (a.subject.toLowerCase() > b.subject.toLowerCase())
              return 1;
            if (a.subject.toLowerCase() < b.subject.toLowerCase())
              return -1;
            return 0;
          });
        case "location":
          return lessons.sort((a, b) => {
            if (a.location.toLowerCase() > b.location.toLowerCase())
              return 1;
            if (a.location.toLowerCase() < b.location.toLowerCase())
              return -1;
            return 0;
          });
        case "price":
          return lessons.sort((a, b) => {
            if (a.price > b.price) return 1;
            if (a.price < b.price) return -1;
            return 0;
          });
        case "availability":
          return lessons.sort((a, b) => {
            if (a.spaces > b.spaces) return 1;
            if (a.spaces < b.spaces) return -1;
            return 0;
          });
      }
    } else if (this.orderBy === "desc") {
      switch (this.sortBy) {
        case "subject":
          return lessons.sort((a, b) => {
            if (a.subject.toLowerCase() > b.subject.toLowerCase())
              return -1;
            if (a.subject.toLowerCase() < b.subject.toLowerCase())
              return 1;
            return 0;
          });
        case "location":
          return lessons.sort((a, b) => {
            if (a.location.toLowerCase() > b.location.toLowerCase())
              return -1;
            if (a.location.toLowerCase() < b.location.toLowerCase())
              return 1;
            return 0;
          });
        case "price":
          return lessons.sort((a, b) => {
            if (a.price > b.price) return -1;
            if (a.price < b.price) return 1;
            return 0;
          });
        case "availability":
          return lessons.sort((a, b) => {
            if (a.spaces > b.spaces) return -1;
            if (a.spaces < b.spaces) return 1;
            return 0;
          });
      }
    }
  },
  isCheckoutFormValid() {
    return Object.keys(this.checkoutForm).every(
      (key) =>
        this.checkoutForm[key].value && !this.checkoutForm[key].error
    );
  },
},

watch: {
  "checkoutForm.name": {
    handler(val) {
    const validationRegex = /[a-zA-Z]+/;

      if (!val.value) val.error = "Please enter your name";
      else if (!validationRegex.test(val.value))
        val.error = "letters only";
      else val.error = "";
    },
    deep: true,
  },

  "checkoutForm.phone": {
    handler(val) {
      const validationRegex = /^((\+44)|(0)) ?\d{4} ?\d{6}$/;

      if (!val.value) val.error = "Please enter your phone number";
      else if (!validationRegex.test(val.value))
        val.error = "Please enter a valid UK phone number";
      else val.error = "";
    },
    deep: true,
  },
},
});