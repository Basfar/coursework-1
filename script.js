new Vue({
el: "#app",


data: {
  loading: false,
  error: null,
  url: "https://xclusivedesigns.co.uk",
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
  lessons: [],
},

methods: {
  async getLessons() {
    try {
      this.loading = true;

      const url = `${this.url}/lessons/?search=${this.searchText}`;

      const response = await fetch(url);

      this.lessons = await response.json();
    } catch (error) {
      this.error = error;
    } finally {
      this.loading = false;
    }
  },
  async createNewOrder(order) {
    try {
      this.loading = true;

      const url = `${this.url}/orders`;

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order),
      });
    } catch (error) {
      this.error = error;
    } finally {
      this.loading = false;
    }
  },
  async updateLesson({ lesson_id, spaces }) {
    try {
      this.loading = true;

      const url = `${this.url}/lessons/${lesson_id}`;

      const response = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spaces: spaces,
        }),
      });
    } catch (error) {
      this.error = error;
    } finally {
      this.loading = false;
    }
  },
  updateLessonSpaces(type, _id) {
    switch (type) {
      case "decrease":
        this.lessons = this.lessons.map((item) => {
          if (item._id === _id && item.spaces > 0)
            return { ...item, spaces: --item.spaces };

          return item;
        });
        break;

      case "reset":
        this.lessons = this.lessons.map((item) => {
          if (item._id === _id) return { ...item, spaces: 5 };

          return item;
        });
        break;

      default:
        break;
    }
  },
  isItemInCart(_id) {
    return !!this.cart.find((item) => item._id === _id);
  },
  addToCart(_id) {
    const lesson = this.lessons.find((lesson) => lesson._id === _id);

    if (!this.isItemInCart(lesson._id)) {
      this.cart.push({
        ...lesson,
        spaces: 1,
      });
    } else {
      if (lesson.spaces > 0) {
        this.cart = this.cart.map((item) => {
          if (item._id === _id)
            return { ...item, spaces: ++item.spaces };
          return item;
        });
      }
    }

    this.updateLessonSpaces("decrease", lesson._id);
  },
  removeFromCart(_id) {
    // get index of cart item
    const index = this.cart.findIndex((item) => item._id === _id);

    // remove item from cart
    this.cart.splice(index, 1);

    // update lesson spaces
    this.updateLessonSpaces("reset", _id);

    // toggle cart display if no item is in cart
    if (!this.cart.length) this.toggleCartDisplay();
  },
  toggleCartDisplay() {
    this.isCartDisplaying = !this.isCartDisplaying;
  },
  checkout() {
    this.cart.forEach(async (item) => {
      await this.createNewOrder({
        name: this.checkoutForm.name.value,
        phone: this.checkoutForm.phone.value,
        lesson_id: item._id,
        spaces: item.spaces,
      });

      await this.updateLesson({
        lesson_id: item._id,
        spaces: item.spaces,
      });
    });

    this.checkedOut = true;

    this.toggleCartDisplay();

    this.cart = [];

    Object.keys(this.checkoutForm).every(
      (key) => (this.checkoutForm[key].value = "")
    );

    setTimeout(() => {
      this.checkedOut = false;
    }, 3000);
  },
},

computed: {
  cartLength() {
    if (this.cart.length > 0)
      return this.cart.reduce((total, item) => total + item.spaces, 0);
    return 0;
  },
  filteredLessons() {
    if (this.lessons.length <= 0) return [];

    const lessons = this.lessons;

    if (this.orderBy === "asc") {
      // ascending
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
      // descending
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

created() {
  // register service worker
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("./service-worker.js", {
          scope: '/coursework-1.github.io/'
        })
        .then((registration) => {
          console.log("Service worker registered: ", registration);
        })
        .catch((error) => {
          console.log("Service worker registration failed: ", error);
        });
    });
  }

  this.getLessons();
},

watch: {
  searchText: {
    handler(val) {
      this.getLessons();
    },
  },
  "checkoutForm.name": {
    handler(val) {
      const validationRegex = /^[A-Za-z\s]*$/;

      if (!val.value) val.error = "Please enter your name";
      else if (!validationRegex.test(val.value))
        val.error = "Your name must only contain letters";
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