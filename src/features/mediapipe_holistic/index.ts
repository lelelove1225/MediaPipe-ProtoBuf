import { Holistic, FACE_GEOMETRY } from "@mediapipe/holistic";

export const processHolistic = () => {
  const holistic = new Holistic();
  const { VertexType, PrimitiveType, Layout, DEFAULT_CAMERA_PARAMS } =
    FACE_GEOMETRY;
  const { getMesh, getPoseTransformMatrix } = holistic;
  const mesh = getMesh();
  const poseTransformMatrix = getPoseTransformMatrix();
  const {
    getVertexBufferList,
    getVertexType,
    getIndexBufferList,
    getPrimitiveType,
  } = mesh;
  const { getPackedDataList, getRows, getCols, getLayout } =
    poseTransformMatrix;
  const vertexBufferList = getVertexBufferList();
  const vertexType = getVertexType();
  const indexBufferList = getIndexBufferList();
  const primitiveType = getPrimitiveType();
  const packedDataList = getPackedDataList();
  const rows = getRows();
  const cols = getCols();
  const layout = getLayout();
  console.log(
    vertexBufferList,
    vertexType,
    indexBufferList,
    primitiveType,
    packedDataList,
    rows,
    cols,
    layout
  );
};
