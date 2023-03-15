/**
 * 获取分页元素（page、size）
 *
 * @export
 * @param {number} [page]
 * @param {number} [size]
 * @param {number} [maxSize=100] 最大 size
 */
export function getPagination(
  page?: number,
  size?: number,
  maxSize = 100,
): {
  page: number;
  size: number;
} {
  const defaultSize = 10;
  const curPage = page ?? 1;
  const curSize = Math.min(size ?? defaultSize, maxSize);

  return {
    page: curPage,
    size: curSize,
  };
}
