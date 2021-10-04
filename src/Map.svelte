<script>
	import * as d3 from 'd3'
	import * as topojson from 'topojson-client'
	import { labelTweaks, matchLabelToTweak } from './labelTweaks'
	import Crest from './components/Crest.svelte'
	import { roundToDecimals } from './utils/math'

	export let showDots = false
	export let animLength = 6
	export let animSpread = 0.08
	export let dotSize = 3
	export let maxGrowthFactor = 1.5
	export let growthDuration = .2
	export let dotPromise = null

	export let bgColor = {r: 75, g: 112, b: 179}
	export let stateColor = {r: 2, g: 16, b: 54}
	export let textColor = {r: 234, g: 245, b:255}
	export let dotColor = {r: 252, g: 193, b: 59}

	let statePromise = fetch('./assets/states.json').then(res => res.json())
	let width = 1388
	let height = 781
	$: viewBox = `0 0 ${width} ${height}`

	const projection = d3.geoAlbersUsa()
		.scale(width*1.1)
		.translate([width / 2, height / 2]);

	const path = d3.geoPath()
		.projection(projection);

	const sortFn = (a, b) => a.geometry.coordinates[0] - b.geometry.coordinates[0]

	const crestSize = 40
	const crestPositions = [
		{ x: .1, y: .37 },
		{ x: .12, y: .53 },
		{ x: .15, y: .56 },
		{ x: .68, y: .62 },
		{ x: .78, y: .44 },
		{ x: .81, y: .3 },
	]
</script>

<svg id="map" viewBox={viewBox}
		class="{showDots ? 'play-anim' : ''}"
		on:click={() => showDots = !showDots}
		style={`--bg: rgb(${bgColor.r},${bgColor.g},${bgColor.b});
					 --state: rgb(${stateColor.r},${stateColor.g},${stateColor.b});
					 --text: rgb(${textColor.r},${textColor.g},${textColor.b});
					 --dots: rgb(${dotColor.r},${dotColor.g},${dotColor.b});
					 --max-growth-factor: ${maxGrowthFactor};
					 --growth-duration: ${growthDuration}s;`}>
{#await statePromise}
	<text x='50%' y='50%' style='transform: translate(-50%, -50%);'>Loading...</text>
{:then states}
	<g class="states">
		{#each topojson.feature(states, states.objects.usStates).features as state, i (`state-${i}`)}
		<path d={path(state)} class="state" data-abbr="{state.properties.STATE_ABBR}"></path>
		{/each}
	</g>
	{#if dotPromise}
	<g class="dots">
		{#await dotPromise}
		<text></text>
		{:then dots}
			{#each dots.features.sort(sortFn) as dot, i (i)}
		<path d={path.pointRadius(dotSize)(dot)} class="zipcode" id={'dot-'+i}
			style={`--delay:${(i+(Math.random()-.5)*dots.features.length*animSpread)/dots.features.length*animLength}s; --cx:${roundToDecimals(projection(dot.geometry.coordinates)[0], 3)}px; --cy:${roundToDecimals(projection(dot.geometry.coordinates)[1], 3)}px;`}></path>
			{/each}
		{/await}
	</g>
	{/if}
	<g class="state-labels">
		{#each topojson.feature(states, states.objects.usStates).features as state, i (`state-label-${i}`)}
		<text x={path.centroid(state)[0]  + ((matchLabelToTweak(state) !== null) ? matchLabelToTweak(state)[0] : 0) }
				  y={path.centroid(state)[1]  + ((matchLabelToTweak(state) !== null) ? matchLabelToTweak(state)[1] : 0) }>{state.properties.STATE_ABBR}</text>
		{/each}
	</g>
{/await}
	{#each crestPositions as crest, i}
		<Crest x={crest.x * width} y={crest.y * height} width={crestSize} height={crestSize} viewBox='0 0 170 170' />
	{/each}
</svg>

<style>
	#map {
		--bg: rgb(75, 112, 179);
		--state: rgb(2, 16, 54);
		--text: rgb(234, 245, 255);
		--dots: rgb(252, 193, 59);
		background: var(--bg);
		width: 80vw;
	}

	text {
		fill: var(--text);
		font-size: 1em;
		text-transform: uppercase;
		transform: translate(-.5em, .25em);
		user-select: none;
	}

	.states {
		fill: var(--state);
		/* transition: all .12s ease-in-out; */
		stroke: var(--bg);
		stroke-width: 0.5px;
	}

	.state {
		position: relative;
	}
	.state::before {
		position: absolute;
		content: var(--abbr);
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		color: white;
	}

	.zipcode {
		--delay: 0s;
		opacity: 0;
		fill: var(--dots);
		transform-origin: var(--cx) var(--cy);
		transform: translateY(1vh);
		/* filter: drop-shadow(2px 0 2px hsla(45deg, 75%, 85%, 0.15)); */
	}

	.play-anim .zipcode {
		animation: appear var(--growth-duration) var(--delay) linear forwards;
	}

	@keyframes appear {
		0% { 
			opacity: 0;
			transform: translateY(1vh) scale(0);
		}
		75% {
			transform: translateY(-.25vh) scale(var(--max-growth-factor));
		}
		100% {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}
</style>