export interface ListBase<T> {
  /** 总条数 */
  total: number;
  /** 页面 */
  size: number;
  /** 每页显示数 */
  page: number;
  /** 列表 */
  list: T[];
}
