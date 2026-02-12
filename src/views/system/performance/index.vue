<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch">
      <el-form-item label="学生名称" prop="studentName">
        <el-input
          v-model="queryParams.studentName"
          placeholder="请输入学生名称"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="审核状态" prop="auditStatus">
        <el-select
          v-model="queryParams.auditStatus"
          placeholder="审核状态"
          clearable
          style="width: 240px"
        >
          <el-option
            v-for="dict in dictionary"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间">
        <el-date-picker
          v-model="dateRange"
          style="width: 240px"
          value-format="yyyy-MM-dd"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        ></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['system:performance:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:performance:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:performance:remove']"
        >删除</el-button>
      </el-col>
<!--      <el-col :span="1.5">-->
<!--        <el-button-->
<!--          type="warning"-->
<!--          plain-->
<!--          icon="el-icon-download"-->
<!--          size="mini"-->
<!--          @click="handleExport"-->
<!--          v-hasPermi="['system:performance:export']"-->
<!--        >导出</el-button>-->
<!--      </el-col>-->
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="performanceList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="课堂表现编号" prop="pId" width="120" />
      <el-table-column label="学生名称" prop="studentName" :show-overflow-tooltip="true" width="100" />
      <el-table-column label="学生年级" prop="studentGrade" :show-overflow-tooltip="true" width="100" />
      <el-table-column label="学生班级" prop="studentClass" :show-overflow-tooltip="true" width="100" />
      <el-table-column label="评价类型" prop="evaluationType" width="150" />
      <el-table-column label="评分项" prop="scoringItem" width="150" />
      <el-table-column label="加扣分数" prop="score" width="100" />
      <el-table-column label="备注" prop="remark" width="150" />
      <el-table-column label="审核状态" align="center" width="100">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.auditStatus"
            active-value="1"
            inactive-value="0"
            @change="handleStatusChange(scope.row)"
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope" v-if="scope.row.pId !== 1">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:performance:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:performance:remove']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改角色配置对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="学生名称" prop="studentName">
          <el-input v-model="form.studentName" placeholder="请输入学生名称" />
        </el-form-item>
        <el-form-item label="学生年级" prop="studentGrade">
          <el-select v-model="form.studentGrade" placeholder="请选择学生年级" clearable>
            <el-option
              v-for="item in studentGradeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="学生班级" prop="studentClass">
          <el-select v-model="form.studentClass" placeholder="请选择学生班级" clearable>
            <el-option
              v-for="item in studentClassOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="评价类型" prop="evaluationType">
          <el-select v-model="form.evaluationType" placeholder="请选择评价类型" clearable>
            <el-option
              v-for="item in evaluationTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="评分项" prop="scoringItem">
          <el-select v-model="form.scoringItem" placeholder="请选择评分项" clearable>
            <el-option
              v-for="item in scoringItemOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="加扣分数" prop="score">
          <el-input-number
            v-model="form.score"
            placeholder="请输入加扣分数"
            :min="-100"
            :max="100"
            :step="1"
            controls-position="right">
          </el-input-number>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { listPerformance, getPerformance, delPerformance, addPerformance, updatePerformance, changePerformanceStatus } from "@/api/system/performance"

export default {
  name: "Performance",
  // dicts: ['sys_normal_disable'],
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      dictionary:[ { label: '未审核', value: '0'}, { label: '审核通过', value: '1'}],
      // 评价类型选项
      evaluationTypeOptions: [
        { label: '不注意安全', value: '不注意安全' },
        { label: '不按时完成任务', value: '不按时完成任务' },
        { label: '课堂表现', value: '课堂表现' },
        { label: '作业完成', value: '作业完成' },
        { label: '考试成绩', value: '考试成绩' },
        { label: '纪律表现', value: '纪律表现' },
        { label: '参与度', value: '参与度' },
        { label: '创新思维', value: '创新思维' },
        { label: '团队合作', value: '团队合作' },
        { label: '学习态度', value: '学习态度' },
      ],
      // 评分项选项
      scoringItemOptions: [
        { label: '玩危险游戏', value: '玩危险游戏' },
        { label: '不按时完成作业', value: '不按时完成作业' },
        { label: '积极发言', value: '积极发言' },
        { label: '完成作业', value: '完成作业' },
        { label: '考试优秀', value: '考试优秀' },
        { label: '遵守纪律', value: '遵守纪律' },
        { label: '主动参与讨论', value: '主动参与讨论' },
        { label: '提出创新想法', value: '提出创新想法' },
        { label: '协助同学', value: '协助同学' },
        { label: '学习认真', value: '学习认真' },
      ],
      // 学生年级选项
      studentGradeOptions: [
        { label: '一年级', value: '一年级' },
        { label: '二年级', value: '二年级' },
        { label: '三年级', value: '三年级' },
        { label: '四年级', value: '四年级' },
        { label: '五年级', value: '五年级' },
        { label: '六年级', value: '六年级' },
        { label: '七年级', value: '七年级' },
        { label: '八年级', value: '八年级' },
        { label: '九年级', value: '九年级' }
      ],
      // 学生班级选项
      studentClassOptions: [
        { label: '1班', value: '1班' },
        { label: '2班', value: '2班' },
        { label: '3班', value: '3班' },
        { label: '4班', value: '4班' },
        { label: '5班', value: '5班' },
        { label: '6班', value: '6班' },
        { label: '7班', value: '7班' },
        { label: '8班', value: '8班' },
        { label: '9班', value: '9班' },
        { label: '10班', value: '10班' },
        { label: '11班', value: '11班' },
        { label: '12班', value: '12班' },
        { label: '13班', value: '13班' },
        { label: '14班', value: '14班' },
        { label: '15班', value: '15班' },
        { label: '16班', value: '16班' },
        { label: '17班', value: '17班' },
        { label: '18班', value: '18班' },
        { label: '19班', value: '19班' },
        { label: '20班', value: '20班' },
        { label: '21班', value: '21班' },
        { label: '22班', value: '22班' },
        { label: '23班', value: '23班' },
        { label: '24班', value: '24班' },
        { label: '25班', value: '25班' },
        { label: '26班', value: '26班' },
        { label: '27班', value: '27班' },
        { label: '28班', value: '28班' },
        { label: '29班', value: '29班' },
        { label: '30班', value: '30班' },
        { label: '31班', value: '31班' },
        { label: '32班', value: '32班' },
        { label: '33班', value: '33班' },
        { label: '34班', value: '34班' },
        { label: '35班', value: '35班' },
        { label: '36班', value: '36班' },
        { label: '37班', value: '37班' },
        { label: '38班', value: '38班' },
        { label: '39班', value: '39班' },
        { label: '40班', value: '40班' },
        { label: '41班', value: '41班' },
        { label: '42班', value: '42班' },
        { label: '43班', value: '43班' },
        { label: '44班', value: '44班' },
        { label: '45班', value: '45班' },
        { label: '46班', value: '46班' },
        { label: '47班', value: '47班' },
        { label: '48班', value: '48班' },
        { label: '49班', value: '49班' },
        { label: '50班', value: '50班' }
      ],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 课堂表现记录数据
      performanceList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 日期范围
      dateRange: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        studentName: undefined,
        auditStatus: undefined
      },
      // 表单参数
      form: {},
      defaultProps: {
        children: "children",
        label: "label"
      },
      // 表单校验
      rules: {
        studentName: [
          { required: true, message: "学生名称不能为空", trigger: "blur" }
        ],
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 查询课堂表现记录列表 */
    getList() {
      this.loading = true
      listPerformance(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
          this.performanceList = response.rows
          this.total = response.total
          this.loading = false
        }
      )
    },
    // 角色状态修改
    handleStatusChange(row) {
      let text = row.auditStatus === "0" ? "未审核" : "审核通过"
      this.$modal.confirm('确认要"' + text + '""' + row.studentName + '"吗？').then(function() {
        return changePerformanceStatus(row.pId, row.auditStatus)
      }).then(() => {
        this.$modal.msgSuccess(text + "成功")
      }).catch(function() {
        row.auditStatus = row.auditStatus === "0" ? "1" : "0"
      })
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.form = {
        pId: undefined,
        studentId: undefined,
        studentName: undefined,
        studentGrade: undefined,
        studentClass: undefined,
        evaluationType: undefined,
        scoringItem: undefined,
        score: undefined,
        status: "0",
        remark: undefined
      }
      this.resetForm("form")
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = []
      this.resetForm("queryForm")
      this.handleQuery()
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.pId)
      this.single = selection.length!=1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.open = true
      this.title = "添加课堂表现记录"
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const pId = row.pId || this.ids
      getPerformance(pId).then(response => {
        this.form = response.data
        this.open = true
      })
      this.title = "修改角色"
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.pId != undefined) {
            updatePerformance(this.form).then(() => {
              this.$modal.msgSuccess("修改成功")
              this.open = false
              this.getList()
            })
          } else {
            addPerformance(this.form).then(() => {
              this.$modal.msgSuccess("新增成功")
              this.open = false
              this.getList()
            })
          }
        }
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const pIds = row.pId || this.ids
      this.$modal.confirm('是否确认删除角色编号为"' + pIds + '"的数据项？').then(function() {
        return delPerformance(pIds)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess("删除成功")
      }).catch(() => {})
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('system/performance/export', {
        ...this.queryParams
      }, `performance_${new Date().getTime()}.xlsx`)
    }
  }
}
</script>
