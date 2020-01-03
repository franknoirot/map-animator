<script>
	import Map from './Map.svelte'
	import ColorPicker from './components/ColorPicker.svelte'
	import { geoBaseData as dotPromise } from './zipToGeo.js'
	
	let showDots = false

	let animParams = {
			animLength: 6,
			animSpread: 0.2,
			dotSize: 3,
			maxGrowthFactor: 1.5,
			growthDuration: .2,
		}
	const rangeUI = [
		{param: 'animLength', label: 'Duration', labelSuffix: ' s', min: 1, max: 10, step: 0.1,},
		{param: 'animSpread', label: 'Spread', labelSuffix: '', min: 0, max: 1, step: 0.01,},
		{param: 'dotSize', label: 'Base Dot Size', labelSuffix: '', min: 1, max: 7, step: 0.1,},
		{param: 'maxGrowthFactor', label: 'Max Dot Size', labelSuffix: 'x', min: 1.1, max: 4.5, step: 0.01,},
		{param: 'growthDuration', label: 'Growth Duration', labelSuffix: ' s', min: .05, max: .5, step: 0.01,},
	]

	const colors = {
		dotColor: {r: 252, g: 193, b: 59},
		bgColor: {r: 75, g:112, b:179},
		stateColor: {r: 2, g: 16, b: 54},
		textColor: {r: 234, g: 245, b:255},
	}
	const colorUI = [
		{param: 'dotColor', label: 'Dot Color'},
		{param: 'bgColor', label: 'Background Color'},
		{param: 'stateColor', label: 'State Color'},
		{param: 'textColor', label: 'Text Color'},
	]

	// dotPromise.then(data => console.log('data fetched! ', data)) // For debugging
</script>

<Map bind:showDots dotPromise={dotPromise}
	{...animParams}	{...colors}></Map>
<section>
	<button class='show-dots' on:click={() => showDots = !showDots}>{(showDots) ? 'Hide' : 'Show'} Dots</button>
	{#each rangeUI as range, i (i)}
	<label class='range-group'>{ range.label }
		<input type="range" min={range.min} max={range.max} step={range.step} value={ animParams[range.param] }
		on:input={e => animParams[range.param] = e.target.value}>
		{animParams[range.param] + range.labelSuffix}
	</label>
	{/each}
</section>
<section>
	{#each colorUI as picker, i (i)}
	<div>
		<ColorPicker bind:rgb={ colors[picker.param] }>
			<p>{ picker.label }</p>
		</ColorPicker>
	</div>
	{/each}
</section>

<style>
	section {
		margin: 2em 0;
		display: grid;
		grid-template-columns: 50% 50%;
		grid-gap: 1em 1.5em;
		width: 95vw;
		max-width: 660px;
	}

	.show-dots {
		grid-column: 1 / 3;
	}

	.range-group {
		display: block;
		width: max-content;
		margin: 1em 0;
	}
</style>