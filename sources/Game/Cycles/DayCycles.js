import * as THREE from 'three/webgpu'
import { Cycles } from './Cycles.js'

const presets = {
    day:   { revealColor: new THREE.Color('#5f7dff'), revealIntensity: 12, electricField: 0, temperature: 5, lightColor: new THREE.Color('#e2f5ff'), lightIntensity: 1.2, shadowColor: new THREE.Color('#345b91'), fogColorA: new THREE.Color('#72d8e4'), fogColorB: new THREE.Color('#8bb6d9'), fogNearRatio: 0.315, fogFarRatio: 1.25 },
    dusk:  { revealColor: new THREE.Color('#ff86d9'), revealIntensity: 5.55, electricField: 0.25, temperature: 0, lightColor: new THREE.Color('#ffc68d'), lightIntensity: 1.2, shadowColor: new THREE.Color('#31516e'), fogColorA: new THREE.Color('#366c96'), fogColorB: new THREE.Color('#dbac99'), fogNearRatio: 0, fogFarRatio: 1.25 },
    night: { revealColor: new THREE.Color('#b678ff'), revealIntensity: 10, electricField: 1, temperature: -7.5, lightColor: new THREE.Color('#3b739c'), lightIntensity: 3.8, shadowColor: new THREE.Color('#243d74'), fogColorA: new THREE.Color('#102c48'), fogColorB: new THREE.Color('#1d455a'), fogNearRatio: -0.85, fogFarRatio: 1 },
    dawn:  { revealColor: new THREE.Color('#ff9d9d'), revealIntensity: 4.85, electricField: 0.25, temperature: 0, lightColor: new THREE.Color('#ffe1ad'), lightIntensity: 1.2, shadowColor: new THREE.Color('#638092'), fogColorA: new THREE.Color('#acc9cf'), fogColorB: new THREE.Color('#e9b477'), fogNearRatio: 0.3, fogFarRatio: 1.25 },
}

export class DayCycles extends Cycles
{
    constructor()
    {
        const forcedProgress = import.meta.env.VITE_DAY_CYCLE_PROGRESS ? parseFloat(import.meta.env.VITE_DAY_CYCLE_PROGRESS) : null
        super('🕜 Day Cycles', 4 * 60, forcedProgress, false)
    }

    get presets()
    {
        return presets
    }

    getKeyframesDescriptions()
    {
        // Debug
        if(this.game.debug.active)
        {
            this.debugPanel.addBinding(this, 'duration', { min: 1, max: 60 * 10, step: 1 })

            for(const presetKey in presets)
            {
                const preset = presets[presetKey]
                const presetsDebugPanel = this.debugPanel.addFolder({
                    title: presetKey,
                    expanded: true,
                })

                this.game.debug.addThreeColorBinding(presetsDebugPanel, preset.revealColor, 'revealColor')
                presetsDebugPanel.addBinding(preset, 'revealIntensity', { min: 0, max: 20, step: 0.001 })
                this.game.debug.addThreeColorBinding(presetsDebugPanel, preset.lightColor, 'lightColor')
                presetsDebugPanel.addBinding(preset, 'lightIntensity', { min: 0, max: 20 })
                this.game.debug.addThreeColorBinding(presetsDebugPanel, preset.shadowColor, 'shadowColor')
                this.game.debug.addThreeColorBinding(presetsDebugPanel, preset.fogColorA, 'fogColorA')
                this.game.debug.addThreeColorBinding(presetsDebugPanel, preset.fogColorB, 'fogColorB')
                presetsDebugPanel.addBinding(preset, 'fogNearRatio', { label: 'near', min: -2, max: 2, step: 0.001 })
                presetsDebugPanel.addBinding(preset, 'fogFarRatio', { label: 'far', min: -2, max: 2, step: 0.001 })
            }
        }

        return [
            [
                { properties: presets.day, stop: 0.0 }, // day
                { properties: presets.day, stop: 0.15 }, // day
                { properties: presets.dusk, stop: 0.25 }, // Dusk
                { properties: presets.night, stop: 0.35 }, // Night
                { properties: presets.night, stop: 0.6 }, // Night
                { properties: presets.dawn, stop: 0.8 }, // Dawn
                { properties: presets.day, stop: 0.9 }, // day
            ]
        ]
    }

    getIntervalDescriptions()
    {
        return [
            { name: 'night', start: 0.25, end: 0.7 },
            { name: 'deepNight', start: 0.35, end: 0.6 },
        ]
    }
}