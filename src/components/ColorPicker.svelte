<script>
  import {RGBToHSL} from '../colorFns'
  export let rgb = {
    r: 0,
    g: 0,
    b: 0
  }
  let reveal = false
  $: hsl = RGBToHSL(rgb)
</script>

<div on:click={() => reveal = !reveal} class={`dropdown ${(reveal) ? 'reveal' : 'hide'}`}
      style={`--bg: hsl(${hsl.h}deg, ${hsl.s}%, ${hsl.l}%);
              --bg-invert: hsl(${hsl.h}deg, ${100 - hsl.l}%, ${(hsl.l > 50) ? 3 : 97}%);`}>
  <slot>
    <p>Color Value</p>
  </slot>
</div>
<div class={(reveal) ? 'revealed' : 'hidden'}>
  <label>Red
    <input type="range" min="0" max="255" bind:value={rgb.r}>
    <input type="number" min="0" max="255" bind:value={rgb.r}>
  </label>
  <label>Green
    <input type="range" min="0" max="255" bind:value={rgb.g}>
    <input type="number" min="0" max="255" bind:value={rgb.g}>
  </label>
  <label>Blue
    <input type="range" min="0" max="255" bind:value={rgb.b}>
    <input type="number" min="0" max="255" bind:value={rgb.b}>
  </label>
</div>

<style>
  div {
    max-width: 720px;
    width: fit-content;
  }

  .dropdown {
    position: relative;
    background: var(--bg);
    color: var(--bg-invert);
    padding: 0 3em 0 2em;
    user-select: none;
  }
  .dropdown:hover {
    cursor: pointer;
  }
  .dropdown::after {
    content: '>';
    position: absolute;
    display: block;
    right: 1em;
    top: 50%;
    transform-origin: 50% 50%;
    transform: translateY(-50%);
    transition: all .12s ease-in-out;
  }
  .reveal::after {
    transform: translateY(-50%) rotate(90deg);
  }

  .hidden {
    display: none;
    height: 0;
    opacity: 0;
    transition: all .12s ease-in-out;
  }
  .revealed {
    display: inline-block;
    height: auto;
    opacity: 1;
  }
</style>