import * as THREE from 'three/webgpu'
import { color, float, Fn, instancedArray, mix, normalWorld, positionGeometry, step, texture, uniform, uv, vec2, vec3, vec4 } from 'three/tsl'
import { Inputs } from '../../Inputs/Inputs.js'
import { InteractivePoints } from '../../InteractivePoints.js'
import { Area } from './Area.js'
import gsap from 'gsap'
import { FontLoader } from 'three/addons/loaders/FontLoader.js'
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js'
import fontData from 'three/examples/fonts/helvetiker_bold.typeface.json'
import { MeshDefaultMaterial } from '../../Materials/MeshDefaultMaterial.js'

export class LandingArea extends Area
{
    constructor(model)
    {
        super(model)

        this.localTime = uniform(0)

        this.setLetters()
        this.setKiosk()
        this.setControls()
        this.setBonfire()
        this.setAchievement()
    }

    setLetters()
    {
        const references = this.references.items.get('letters') || []
        const center = new THREE.Vector3()
        for(const reference of references)
        {
            center.add(reference.position)
            const original = reference.userData.object
            original.physical?.body.setEnabled(false)
            original.visual?.object3D.traverse(child => { if(child.isMesh) child.visible = false })
        }
        if(references.length) center.divideScalar(references.length)
        else center.copy(this.model.position)

        const font = new FontLoader().parse(fontData)
        const heading = Math.PI * 0.25
        const headingRotation = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), heading)
        // Letters lie face-up in two rows, so both names remain legible before a collision.
        const letterRotation = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, heading, 0, 'YXZ'))
        const rows = [
            { text: 'JAINAM', width: 9.8, z: -1.15, color: '#79e0dc' },
            { text: 'DAMANWALA', width: 11.8, z: 1.15, color: '#ffd18c' },
        ]
        this.nameLetters = []
        // Populate ray queries before the first simulation tick, including newly added scenery.
        this.game.physics.world.updateSceneQueries()
        for(const row of rows)
        {
            const gap = 0.1
            const geometries = [...row.text].map(letter => {
                const geometry = new TextGeometry(letter, {
                    font, size: 1, depth: 0.22, curveSegments: 5,
                    bevelEnabled: true, bevelThickness: 0.018,
                    bevelSize: 0.012, bevelSegments: 2,
                })
                geometry.computeBoundingBox()
                const width = geometry.boundingBox.max.x - geometry.boundingBox.min.x
                return { letter, geometry, width }
            })
            const unscaledWidth = geometries.reduce((sum, item) => sum + item.width, 0) + gap * (geometries.length - 1)
            const scale = row.width / unscaledWidth
            let cursor = -row.width / 2
            for(const item of geometries)
            {
                const geometry = item.geometry
                geometry.center()
                geometry.scale(scale, scale, scale)
                geometry.computeBoundingBox()
                geometry.setAttribute('uv1', geometry.getAttribute('uv').clone())
                const size = geometry.boundingBox.getSize(new THREE.Vector3())
                const position = new THREE.Vector3(cursor + size.x / 2, 0, row.z)
                    .applyQuaternion(headingRotation).add(center)
                const ray = new this.game.RAPIER.Ray({ x: position.x, y: 10, z: position.z }, { x: 0, y: -1, z: 0 })
                const ground = this.game.physics.world.castRay(ray, 20, true, this.game.RAPIER.QueryFilterFlags.EXCLUDE_DYNAMIC)
                const groundY = ground ? 10 - ground.timeOfImpact : 0.1
                position.y = groundY + size.z / 2 + 0.035
                const mesh = new THREE.Mesh(geometry, new MeshDefaultMaterial({ colorNode: color(row.color), hasWater: false }))
                mesh.name = `name-${row.text}-${item.letter}-${this.nameLetters.length}`
                const object = this.game.objects.add(
                    { model: mesh, updateMaterials: false, castShadow: true, receiveShadow: true },
                    {
                        type: 'dynamic', position, rotation: letterRotation.clone(),
                        enabled: true, sleeping: true, canSleep: true,
                        mass: 0.45, friction: 0.65, restitution: 0.2,
                        linearDamping: 0.15, angularDamping: 0.25,
                        colliders: [{ shape: 'hull', parameters: [geometry.getAttribute('position').array], category: 'object' }],
                        contactThreshold: 5,
                        onCollision: (force, hitPosition) => this.game.audio.groups.get('hitBrick')?.playRandomNext(force, hitPosition),
                    }
                )
                object.physical.body.enableCcd(true)
                this.nameLetters.push(object)
                cursor += size.x + gap * scale
            }
        }
        this.resetName = () => this.nameLetters.forEach(object => this.game.objects.resetObject(object))
        const resetButton = document.querySelector('#reset-name')
        if(resetButton)
        {
            resetButton.disabled = false
            resetButton.addEventListener('click', this.resetName)
        }
    }

    setKiosk()
    {
        // Interactive point
        const interactivePoint = this.game.interactivePoints.create(
            this.references.items.get('kioskInteractivePoint')[0].position,
            'Map',
            InteractivePoints.ALIGN_RIGHT,
            InteractivePoints.STATE_CONCEALED,
            () =>
            {
                this.game.inputs.interactiveButtons.clearItems()
                this.game.modals.open('map')
                // interactivePoint.hide()
            },
            () =>
            {
                this.game.inputs.interactiveButtons.addItems(['interact'])
            },
            () =>
            {
                this.game.inputs.interactiveButtons.removeItems(['interact'])
            },
            () =>
            {
                this.game.inputs.interactiveButtons.removeItems(['interact'])
            }
        )

        // this.game.map.items.get('map').events.on('close', () =>
        // {
        //     interactivePoint.show()
        // })
    }

    setControls()
    {
        // Interactive point
        const interactivePoint = this.game.interactivePoints.create(
            this.references.items.get('controlsInteractivePoint')[0].position,
            'Controls',
            InteractivePoints.ALIGN_RIGHT,
            InteractivePoints.STATE_CONCEALED,
            () =>
            {
                this.game.inputs.interactiveButtons.clearItems()
                this.game.menu.open('controls')
                interactivePoint.hide()
            },
            () =>
            {
                this.game.inputs.interactiveButtons.addItems(['interact'])
            },
            () =>
            {
                this.game.inputs.interactiveButtons.removeItems(['interact'])
            },
            () =>
            {
                this.game.inputs.interactiveButtons.removeItems(['interact'])
            }
        )

        // Menu instance
        const menuInstance = this.game.menu.items.get('controls')

        menuInstance.events.on('close', () =>
        {
            interactivePoint.show()
        })

        menuInstance.events.on('open', () =>
        {
            if(this.game.inputs.mode === Inputs.MODE_GAMEPAD)
                menuInstance.tabs.goTo('gamepad')
            else if(this.game.inputs.mode === Inputs.MODE_MOUSEKEYBOARD)
                menuInstance.tabs.goTo('mouse-keyboard')
            else if(this.game.inputs.mode === Inputs.MODE_TOUCH)
                menuInstance.tabs.goTo('touch')
        })
    }

    setBonfire()
    {
        const position = this.references.items.get('bonfireHashes')[0].position

        // Particles
        let particles = null
        {
            const emissiveMaterial = this.game.materials.getFromName('emissiveOrangeRadialGradient')
    
            const count = 30
            const elevation = uniform(5)
            const positions = new Float32Array(count * 3)
            const scales = new Float32Array(count)
    
    
            for(let i = 0; i < count; i++)
            {
                const i3 = i * 3
    
                const angle = Math.PI * 2 * Math.random()
                const radius = Math.pow(Math.random(), 1.5) * 1
                positions[i3 + 0] = Math.cos(angle) * radius
                positions[i3 + 1] = Math.random()
                positions[i3 + 2] = Math.sin(angle) * radius
    
                scales[i] = 0.02 + Math.random() * 0.06
            }
            
            const positionAttribute = instancedArray(positions, 'vec3').toAttribute()
            const scaleAttribute = instancedArray(scales, 'float').toAttribute()
    
            const material = new THREE.SpriteNodeMaterial()
            material.outputNode = emissiveMaterial.outputNode
    
            const progress = float(0).toVar()
    
            material.positionNode = Fn(() =>
            {
                const newPosition = positionAttribute.toVar()
                progress.assign(newPosition.y.add(this.localTime.mul(newPosition.y)).fract())
    
                newPosition.y.assign(progress.mul(elevation))
                newPosition.xz.addAssign(this.game.wind.direction.mul(progress))
    
                const progressHide = step(0.8, progress).mul(100)
                newPosition.y.addAssign(progressHide)
                
                return newPosition
            })()
            material.scaleNode = Fn(() =>
            {
                const progressScale = progress.remapClamp(0.5, 1, 1, 0)
                return scaleAttribute.mul(progressScale)
            })()
    
            const geometry = new THREE.CircleGeometry(0.5, 8)
    
            particles = new THREE.Mesh(geometry, material)
            particles.visible = false
            particles.position.copy(position)
            particles.count = count
            this.game.scene.add(particles)
        }

        // Hashes
        {
            const alphaNode = Fn(() =>
            {
                const baseUv = uv(1)
                const distanceToCenter = baseUv.sub(0.5).length()
    
                const voronoi = texture(
                    this.game.noises.voronoi,
                    baseUv
                ).g
    
                voronoi.subAssign(distanceToCenter.remap(0, 0.5, 0.3, 0))
    
                return voronoi
            })()
    
            const material = new MeshDefaultMaterial({
                colorNode: color(0x6F6A87),
                alphaNode: alphaNode,
                hasWater: false,
                hasLightBounce: false
            })
    
            const mesh = this.references.items.get('bonfireHashes')[0]
            mesh.material = material
        }

        // Burn
        const burn = this.references.items.get('bonfireBurn')[0]
        burn.visible = false

        // Interactive point
        this.game.interactivePoints.create(
            this.references.items.get('bonfireInteractivePoint')[0].position,
            'Res(e)t',
            InteractivePoints.ALIGN_RIGHT,
            InteractivePoints.STATE_CONCEALED,
            () =>
            {
                this.game.reset()

                gsap.delayedCall(2, () =>
                {
                    // Bonfire
                    particles.visible = true
                    burn.visible = true
                    this.game.ticker.wait(2, () =>
                    {
                        particles.geometry.boundingSphere.center.y = 2
                        particles.geometry.boundingSphere.radius = 2
                    })

                    // Sound
                    this.game.audio.groups.get('campfire').items[0].positions.push(position)
                })
            },
            () =>
            {
                this.game.inputs.interactiveButtons.addItems(['interact'])
            },
            () =>
            {
                this.game.inputs.interactiveButtons.removeItems(['interact'])
            },
            () =>
            {
                this.game.inputs.interactiveButtons.removeItems(['interact'])
            }
        )
    }

    setAchievement()
    {
        this.events.on('boundingIn', () =>
        {
            this.game.achievements.setProgress('areas', 'landing')
        })
        this.events.on('boundingOut', () =>
        {
            this.game.achievements.setProgress('landingLeave', 1)
        })
    }

    update()
    {
        this.localTime.value += this.game.ticker.deltaScaled * 0.1
    }
}
