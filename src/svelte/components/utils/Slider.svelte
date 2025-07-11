<script lang="ts">
export let value: boolean = false;
export let onChange: () => void = () => {};
export let disabled: boolean = false;
</script>

<button
   class="focus:ring-bg-accent-focus relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-offset-2 focus:outline-none {disabled
      ? 'cursor-not-allowed opacity-50'
      : 'cursor-pointer'} {value ? 'bg-blue-500' : 'bg-base-400'}"
   disabled={disabled}
   aria-label="slider"
   onclick={onChange}>
   <span
      class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
      {value ? 'translate-x-5' : 'translate-x-0'}"></span>
</button>
