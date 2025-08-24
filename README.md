# Planetarium

https://planetarium-viewer.vercel.app

A model of astronomical objects in orbit. Currently just randomly generated spheres orbiting around a "sun". Future versions will use data from NASA API.

https://github.com/user-attachments/assets/c3842b13-083e-45f3-a213-5a8d9aa4e12c

### Goals:
- Build a fullstack web app with 3D objects
- Learn Three.js
- Learn Flask

### Diagram
<pre>
                           GET fixed number
+----------------------+   of planets        +------------------------------+
| Flask Backend        |<------------------->| Vite/React Frontend          |
| - Generate list of   |                     | - Request list of planets    |
|   randomized planets |<------------------->| - Render and animate planets |
+----------------------+  POST a variable    +------------------------------+
                          number of planets
</pre>
