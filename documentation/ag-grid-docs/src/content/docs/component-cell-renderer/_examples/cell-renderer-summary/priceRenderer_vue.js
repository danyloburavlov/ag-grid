export default {
  template: `<span class="imgSpan">
      <img v-for="images in arr" :src="src" class="priceIcon" />
      </span>`,
  data: function () {
      return {
          arr: [],
          src: 'https://www.ag-grid.com/example-assets/pound.png',
          priceMultiplier: 1,
      };
  },
  beforeMount() {
      this.updateDisplay(this.params);
  },
  methods: {
      refresh(params) {
          this.updateDisplay(params);
      },
      updateDisplay(params) {
        if (params.value > 5000000) {
          this.priceMultiplier = 2
        }
        if (params.value > 10000000) {
          this.priceMultiplier = 3
        }
        if (params.value > 25000000) {
          this.priceMultiplier = 4
        }
        if (params.value > 20000000) {
          this.priceMultiplier = 5
        }
        this.arr = new Array(this.priceMultiplier);
      },
  },
};