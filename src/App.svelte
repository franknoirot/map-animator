<script>
	import Map from './Map.svelte'
	import ColorPicker from './components/ColorPicker.svelte'
	import { geoBaseData as dotPromise } from './zipToGeo.js'
	
	let animParams = {
			animLength: 6,
			animSpread: 0.2,
			dotSize: 3,
			maxGrowthFactor: 1.5,
			growthDuration: .2,
		}
	let showDots = false
	let colors = {
		dotColor: {r: 252, g: 193, b: 59},
		bgColor: {r: 75, g:112, b:179},
		stateColor: {r: 2, g: 16, b: 54},
		textColor: {r: 234, g: 245, b:255},
	}

	// dotPromise.then(data => console.log('data fetched! ', data)) // For debugging
</script>

<Map bind:showDots dotPromise={dotPromise}
	{...animParams}	{...colors}></Map>
<section>
	<button class='show-dots' on:click={() => showDots = !showDots}>{(showDots) ? 'Hide' : 'Show'} Dots</button>
	<label class='range-group'>Duration
		<input type="range" min='1' max='10' step="0.1" value={ animParams.animLength } on:input={e => animParams.animLength = e.target.value}>
		{animParams.animLength} seconds
	</label>
	<label class='range-group'>Spread
		<input type="range" min='0' max='1' step="0.01" value={ animParams.animSpread } on:input={e => animParams.animSpread = e.target.value}>
		{animParams.animSpread}
	</label>
	<label class='range-group'>Base Dot Size
		<input type="range" min='1' max='7' step="0.1" value={ animParams.dotSize } on:input={e => animParams.dotSize = e.target.value}>
		{animParams.dotSize}
	</label>
	<label class='range-group'>Max Dot Size
		<input type="range" min='1.1' max='4.5' step="0.01" value={ animParams.maxGrowthFactor } on:input={e => animParams.maxGrowthFactor = e.target.value}>
		{animParams.maxGrowthFactor}
	</label>
	<label class='range-group'>Growth Duration
		<input type="range" min='.05' max='.5' step="0.01" value={ animParams.growthDuration } on:input={e => animParams.growthDuration = e.target.value}>
		{animParams.growthDuration}
	</label>
</section>
<section>
	<ColorPicker bind:rgb={colors.dotColor}>
		<p>Dot Color</p>
	</ColorPicker>
	<ColorPicker bind:rgb={colors.bgColor}>
		<p>Background Color</p>
	</ColorPicker>
	<ColorPicker bind:rgb={colors.stateColor}>
		<p>State Color</p>
	</ColorPicker>
	<ColorPicker bind:rgb={colors.textColor}>
		<p>Text Color</p>
</ColorPicker>
</section>

<style>
	section {
		margin: 2em 0;
		display: grid;
		grid-template-columns: 50% 50%;
		grid-gap: 2em;
		width: 95vw;
		max-width: 600px;
	}

	.show-dots {
		grid-column: 1 / 3;
	}

	.range-group {
		display: block;
		margin: 1em 0;
	}
</style>