<script>
	import Map from './Map.svelte'
	import ColorPicker from './ColorPicker.svelte'
	
	let dotPromise = fetch('./assets/zipcode_data.json').then(res => res.json())
	let animParams = {
			animLength: 6,
			animSpread: 0.2,
			dotSize: 3
		}
	let showDots = false
	let colors = {
		dotColor: {r: 252, g: 193, b: 59},
		bgColor: {r: 75, g:112, b:179},
		stateColor: {r: 2, g: 16, b: 54},
		textColor: {r: 234, g: 245, b:255}
	}
</script>

<Map bind:showDots dotPromise={dotPromise}
	{...animParams}	{...colors}></Map>
<section>
	<button on:click={() => showDots = !showDots}>{(showDots) ? 'Hide' : 'Show'} Dots</button>
	<label class='range-group'>Duration
		<input type="range" min='1' max='10' step="0.1" value="6" on:input={e => animParams.animLength = e.target.value}>
		{animParams.animLength} seconds
	</label>
	<label class='range-group'>Spread
		<input type="range" min='0' max='1' step="0.01" value="0.08" on:input={e => animParams.animSpread = e.target.value}>
		{animParams.animSpread}
	</label>
	<label class='range-group'>Dot Size
		<input type="range" min='1' max='7' step="0.1" value="2.5" on:input={e => animParams.dotSize = e.target.value}>
		{animParams.dotSize}
	</label>
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
		display: flex;
		flex-direction: column;
		width: 80vw;
		max-width: 600px;
	}

	.range-group {
		display: block;
		margin: 1em 0;
	}
</style>