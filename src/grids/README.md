# grids

Star Citizen vehicle cargo grid data used by sc-cargo.space.


## Top-level schema

Each file in this repo is one vehicle definition.

```json
{
	"manufacturer": "Drake",
	"name": "Vulture",
	"official": {
		"capacity": 13,
		"groups": [
			{
				"x": 0,
				"z": 0,
				"grids": [
					{
						"x": 0,
						"y": 0,
						"z": 0,
						"width": 1,
						"height": 1,
						"length": 1,
						"maxSize": 1
					},
					{
						"x": 0,
						"y": 0,
						"z": 1,
						"width": 2,
						"height": 2,
						"length": 3,
						"maxSize": 1
					}
				]
			}
		],
		"labels": [
			{ "value": "Vulture", "x": 10, "z": -20, "fontSize": 5 },
			{ "value": "${scu}", "x": 10, "z": -27, "fontSize": 5 }
		]
	},
	"unofficial": {
		"capacity": 26,
		"groups": [
			{
				"x": 0,
				"z": 0,
				"grids": [
					{
						"x": 0,
						"y": 0,
						"z": 1,
						"width": 1,
						"height": 1,
						"length": 1,
						"maxSize": 1
					},
					{
						"x": 0,
						"y": 0,
						"z": 2,
						"width": 2,
						"height": 2,
						"length": 3,
						"maxSize": 1
					},
					{
						"x": 2,
						"y": 0,
						"z": 0,
						"width": 1,
						"height": 2,
						"length": 5,
						"maxSize": 1,
						"unsecured": true
					},
					{
						"x": 1,
						"y": 0,
						"z": 1,
						"width": 1,
						"height": 2,
						"length": 1,
						"maxSize": 1,
						"unsecured": true
					},
					{
						"x": 0,
						"y": 0,
						"z": 1,
						"width": 1,
						"height": 1,
						"length": 1,
						"maxSize": 1,
						"unsecured": true
					}
				]
			}
		],
		"labels": [
			{ "value": "Vulture (Unofficial)", "x": 15, "z": -20, "fontSize": 5 },
			{ "value": "${scu}", "x": 15, "z": -27, "fontSize": 5 }
		]
	}
}
```

## Field reference

- The top-level object is a [Vehicle](#vehicle).
- Vehicle.official is required and points to a Layout object.
- Vehicle.unofficial is optional and, when present, also points to a Layout object.
- So "Layout" is the shared object shape used by both official and unofficial.

### Vehicle

- manufacturer (required, string): Vehicle manufacturer.
- name (required, string): Vehicle name.
- official (required, [Layout](#layout)): Official cargo layout object.
- unofficial (optional, [Layout](#layout)): Alternate layout object that can include grids with containers that are "unsecured" or "off-grid".
- labels (optional, [Label](#label)[]): Labels shown for both official and unofficial views.
- alternativeNames (optional, string[]): Alias names for url parameters.

### Layout

This is the object type used by Vehicle.official and Vehicle.unofficial.

- name (optional, string): Layout label such as "official" or "community".
- capacity (required, number): Total SCU capacity for this layout.
- groups (required, [Group](#group)[]): One or more grouped cargo areas.
- labels (optional, [Label](#label)[]): Labels shown only for this layout.


### Group

Represents a contiguous space in which multiple grids belong to. For example, the C2 has one large cargo bay with two cargo grids. These two grids belong to the same group.

- name (optional, string): Human-friendly group name (for example, "rear bay").
- x (required, number): Group origin on X axis.
- z (required, number): Group origin on Z axis.
- grids (required, [Grid](#grid)[]): Grid volumes in this group.

### Grid

- name (optional, string): Human-friendly grid name.
- x, y, z (required, number): Grid offset from the Group origin.
- width, height, length (required, number): Grid dimensions in SCU units.
- maxSize (optional, number): Largest container size allowed in this grid.
- minSize (optional, number): Smallest container size allowed in this grid.
- unsecured (optional, boolean): Marks all containers as "off-grid".
- preferHorizontal (optional, boolean): Packing preference for container orientation.

### Label

- value (required, string): Label text. Supports tokens like ${scu}.
- x, z (required, number): Label position in space.
- fontSize (optional, number): Text size.
- rotation (optional, number): Rotation in degrees.
