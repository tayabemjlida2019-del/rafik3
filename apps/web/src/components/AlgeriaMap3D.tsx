'use client';

import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

export default function AlgeriaMap3D() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // Scene setup
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

        renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        containerRef.current.appendChild(renderer.domElement);

        // Abstract Algeria Shape (Simplified Polygon)
        // Coordinates are normalized abstractions of Algeria's borders
        const shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.lineTo(1, 0.2);
        shape.lineTo(1.2, 0.8);
        shape.lineTo(0.8, 1.2);
        shape.lineTo(0.2, 1.4);
        shape.lineTo(-0.4, 1.2);
        shape.lineTo(-0.6, 0.6);
        shape.lineTo(-0.2, 0.2);
        shape.closePath();

        const extrudeSettings = {
            steps: 2,
            depth: 0.2,
            bevelEnabled: true,
            bevelThickness: 0.05,
            bevelSize: 0.05,
            bevelOffset: 0,
            bevelSegments: 5
        };

        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        geometry.center();

        const material = new THREE.MeshStandardMaterial({
            color: 0xC6A75E,
            metalness: 0.9,
            roughness: 0.1,
            envMapIntensity: 1
        });

        const mapMesh = new THREE.Mesh(geometry, material);
        scene.add(mapMesh);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        scene.add(ambientLight);

        const pointLight1 = new THREE.PointLight(0xC6A75E, 2, 10);
        pointLight1.position.set(2, 2, 2);
        scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0xffffff, 1, 10);
        pointLight2.position.set(-2, -2, 2);
        scene.add(pointLight2);

        camera.position.z = 3;

        // Animation loop
        let frame = 0;
        const animate = () => {
            frame += 0.01;
            requestAnimationFrame(animate);

            mapMesh.rotation.y = Math.sin(frame * 0.5) * 0.2;
            mapMesh.rotation.x = Math.cos(frame * 0.3) * 0.1;
            mapMesh.position.y = Math.sin(frame) * 0.1;

            renderer.render(scene, camera);
        };

        animate();

        // Handle resize
        const handleResize = () => {
            if (!containerRef.current) return;
            camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (containerRef.current) {
                containerRef.current.removeChild(renderer.domElement);
            }
            renderer.dispose();
            geometry.dispose();
            material.dispose();
        };
    }, []);

    return <div ref={containerRef} className="w-full h-full" />;
}
