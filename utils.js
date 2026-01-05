function lerp (A, B, t) {
    return A + (B - A) * t;
}

function getIntersection(A, B, C, D) {
    const tTop = (D.x - C.x)*(A.y - C.y)-(D.y - C.y)*(A.x - C.x);
    const uTop = (C.y - A.y)*(A.x - B.x)-(C.x - A.x)*(A.y - B.y);
    const bottom = (D.y - C.y)*(B.x - A.x)-(D.x - C.x)*(B.y - A.y);

    if (bottom != 0) {
        const t = tTop / bottom;
        const u = uTop / bottom;
        if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
            return {
                x: lerp(A.x, B.x, t),
                y: lerp(A.y, B.y, t),
                offset: t
            }
        }
    }

    return null;
}

// taking all segments that make the first object and compare them against every segment of other object and if there is a touch, return true, and else, return false
function containerIntersect(object1, object2) {
    // loop through all of the points in first object
    for (let i = 0; i < object1.length; i++) {
        // for each of them, check all the points of the second object
        for (let j = 0; j < object2.length; j++) {
            // see if they check or not 
            const touch = getIntersection(
                object1[i],
                object1[(i + 1) % object1.length],
                object2[j],
                object2[(j + 1) % object2.length]
            );
            if (touch) {
                return true;
            }
        }
    }
    return false;
}

function getRGBA(value){
    const alpha=Math.abs(value);
    const R=value<0?0:255;
    const G=R;
    const B=value>0?0:255;
    return "rgba("+R+","+G+","+B+","+alpha+")";
}
