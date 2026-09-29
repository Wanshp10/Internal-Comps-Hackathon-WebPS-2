// ------------------------------------
// Visual node dimensions
// Keep these aligned with StepNode.css
// ------------------------------------
const NODE_WIDTH = 300;
const NODE_HEIGHT = 145;

const HORIZONTAL_GAP = 70;
const VERTICAL_GAP = 70;

// ------------------------------------
// Places dependency graphs into layers.
//
// Layer 0 = no prerequisites
// Layer 1 = depends on layer 0
// Layer 2 = depends on layer 1
// etc.
// ------------------------------------
export function layoutGraph(
  nodes,
  edges,
) {
  if (!nodes.length) {
    return [];
  }

  const dependencies =
    new Map(
      nodes.map((node) => [
        node.id,
        [],
      ]),
    );

  edges.forEach((edge) => {
    if (
      !dependencies.has(
        edge.target,
      )
    ) {
      dependencies.set(
        edge.target,
        [],
      );
    }

    dependencies
      .get(edge.target)
      .push(edge.source);
  });

  const layerMap =
    new Map();

  const visiting =
    new Set();

  function calculateLayer(
    nodeId,
  ) {
    if (
      layerMap.has(nodeId)
    ) {
      return layerMap.get(
        nodeId,
      );
    }

    if (
      visiting.has(nodeId)
    ) {
      console.warn(
        `Circular dependency detected involving "${nodeId}".`,
      );

      return 0;
    }

    visiting.add(nodeId);

    const nodeDependencies =
      dependencies.get(
        nodeId,
      ) || [];

    if (
      nodeDependencies.length ===
      0
    ) {
      layerMap.set(
        nodeId,
        0,
      );

      visiting.delete(
        nodeId,
      );

      return 0;
    }

    const dependencyLayers =
      nodeDependencies.map(
        calculateLayer,
      );

    const layer =
      Math.max(
        ...dependencyLayers,
      ) + 1;

    layerMap.set(
      nodeId,
      layer,
    );

    visiting.delete(
      nodeId,
    );

    return layer;
  }

  nodes.forEach(
    (node) => {
      calculateLayer(
        node.id,
      );
    },
  );

  const layers =
    new Map();

  nodes.forEach(
    (node) => {
      const layer =
        layerMap.get(
          node.id,
        ) ?? 0;

      if (
        !layers.has(layer)
      ) {
        layers.set(
          layer,
          [],
        );
      }

      layers
        .get(layer)
        .push(node);
    },
  );

  const positionedNodes =
    [];

  [
    ...layers.entries(),
  ]
    .sort(
      ([a], [b]) =>
        a - b,
    )
    .forEach(
      ([
        layer,
        layerNodes,
      ]) => {
        const totalWidth =
          layerNodes.length *
            NODE_WIDTH +
          Math.max(
            0,
            layerNodes.length -
              1,
          ) *
            HORIZONTAL_GAP;

        const startX =
          -totalWidth / 2;

        layerNodes.forEach(
          (
            node,
            index,
          ) => {
            positionedNodes.push(
              {
                ...node,

                position: {
                  x:
                    startX +
                    index *
                      (NODE_WIDTH +
                        HORIZONTAL_GAP),

                  y:
                    layer *
                    (NODE_HEIGHT +
                      VERTICAL_GAP),
                },
              },
            );
          },
        );
      },
    );

  return positionedNodes;
}