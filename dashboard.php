<!doctype html>
<html lang="en">
   <head>
      <?php include('header.php')?>
   </head>
   <body>
      <!-- ============================================================== -->
      <!-- main wrapper -->
      <!-- ============================================================== -->
      <div class="dashboard-main-wrapper">
         <!-- ============================================================== -->
         <!-- navbar -->
         <!-- ============================================================== -->
         <?php include('sidebar.php')?>
         <!-- ============================================================== -->
         <!-- end left sidebar -->
         <!-- ============================================================== -->
         <!-- ============================================================== -->
         <!-- wrapper  -->
         <!-- ============================================================== -->
         <div class="dashboard-wrapper">
            <div class="dashboard-ecommerce">
               <div class="container-fluid dashboard-content ">
                  <!-- ============================================================== -->
                  <!-- pageheader  -->
                  <!-- ============================================================== -->
                  <div class="row">
                     <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12">
                        <div class="page-header">
                           <h2 class="pageheader-title">Dashboard</dAtag> </h2>
                        </div>
                     </div>
                  </div>
                  <div class="row">
                     <!-- ============================================================== -->
                     <!-- four widgets   -->
                     <!-- ============================================================== -->
                     <!-- ============================================================== -->
                     <!-- total views   -->
                     <!-- ============================================================== -->
                     <div class="col-xl-3 col-lg-6 col-md-6 col-sm-12 col-12">
                        <div class="card" style="height:140px !important">
                           <div class="card-body">
                              <div class="d-inline-block" style="width:50% !important;">
                                 <h5 class="text-muted" style="height:50px;">Total Users</h5>
                                 <h2 class="mb-0"><?php echo $dash_data['total_user']?></h2>
                              </div>
                              <div class="float-right icon-circle-medium  icon-box-lg  bg-info-light mt-1">
                                 <i class="fa fa-user-circle fa-fw fa-sm text-info"></i>
                              </div>
                           </div>
                        </div>
                     </div>

							<div class="col-xl-3 col-lg-6 col-md-6 col-sm-12 col-12">
                        <div class="card" style="height:140px !important">
                           <div class="card-body">
                              <div class="d-inline-block" style="width:50% !important;">
                                 <h5 class="text-muted" style="height:50px;">Total Pending Phase 1 Users</h5>
                                 <h2 class="mb-0"><?php echo $dash_data['total_phase1_pending']?></h2>
                              </div>
                              <div class="float-right icon-circle-medium  icon-box-lg  bg-brand-light mt-1">
                                 <i class="fa fa-user-circle fa-fw fa-sm text-brand"></i>
                              </div>
                           </div>
                        </div>
                     </div>
							<div class="col-xl-3 col-lg-6 col-md-6 col-sm-12 col-12">
                        <div class="card" style="height:140px !important">
                           <div class="card-body">
                              <div class="d-inline-block" style="width:50% !important;">
                                 <h5 class="text-muted" style="height:50px;">Total Pending Phase 2 Users</h5>
                                 <h2 class="mb-0"><?php echo $dash_data['total_phase2_pending']?></h2>
                              </div>
                              <div class="float-right icon-circle-medium  icon-box-lg  bg-brand-light mt-1">
                                 <i class="fa fa-user-circle fa-fw fa-sm text-brand"></i>
                              </div>
                           </div>
                        </div>
                     </div>
                     <!-- ============================================================== -->
                     <!-- end total views   -->
                     <!-- ============================================================== -->
                     <!-- ============================================================== -->
                     <!-- total followers   -->
                     <!-- ============================================================== -->
                     <div class="col-xl-3 col-lg-6 col-md-6 col-sm-12 col-12">
                        <div class="card" style="height:140px !important">
                           <div class="card-body">
                              <div class="d-inline-block" style="width:60% !important;">
                                 <h5 class="text-muted" style="height:50px;">Total Approved Users</h5>
                                 <h2 class="mb-0"><?php echo $dash_data['total_approve']?></h2>
                              </div>
                              <div class="float-right icon-circle-medium  icon-box-lg  bg-success-light mt-1">
                                 <i class="fa fa-user-circle fa-fw fa-sm text-success"></i>
                              </div>
                           </div>
                        </div>
                     </div>
                     <!-- ============================================================== -->
                     <!-- end total followers   -->
                     <!-- ============================================================== -->
                     <!-- ============================================================== -->
                     <!-- partnerships   -->
                     <!-- ============================================================== -->
                     <div class="col-xl-3 col-lg-6 col-md-6 col-sm-12 col-12">
                        <div class="card" style="height:140px !important">
                           <div class="card-body">
                              <div class="d-inline-block" style="width:50% !important;">
                                 <h5 class="text-muted" style="height:50px;">Total Reject Users</h5>
                                 <h2 class="mb-0"><?php echo $dash_data['total_reject']?></h2>
                              </div>
                              <div class="float-right icon-circle-medium  icon-box-lg  bg-secondary-light mt-1">
                                 <i class="fa fa-user-circle fa-fw fa-sm text-secondary"></i>
                              </div>
                           </div>
                        </div>
                     </div>
                     <!-- ============================================================== -->
                     <!-- end partnerships   -->
                     <!-- ============================================================== -->
                     <!-- ============================================================== -->
                     <!-- total earned   -->
                     <!-- ============================================================== -->
                    
                     <!-- ============================================================== -->
                     <!-- end total earned   -->
                     <!-- ============================================================== -->
                </div>

					
					 <div class="row">
						<div class="col-xl-4 col-lg-6 col-md-6 col-sm-12 col-12">
						<?php 
					$success=$this->session->flashdata('success');
					$error=$this->session->flashdata('error');
					
					if(!empty($success)) { ?>

					<div class="alert alert-success">
					<strong>Success!</strong> <?php echo $this->session->flashdata('success'); ?>
					</div>

					<?php } ?>
					<?php if(!empty($error)) { ?>

					<div class="alert alert-danger">
					<strong>Error!</strong> <?php echo $this->session->flashdata('error'); ?>
					</div>

					<?php } ?>
							<div class="card">
								<h5 class="card-header">Admin Default Referral</h5>
								<div class="card-body">
									<form id="changepassForm" name="changepassForm" action="<?php echo base_url()?>index.php/webadmin/Dashboard/update_ref" method="post" class="form-horizontal form-label-left">
										<div class="form-group">
											<label class="col-form-label">Current Referral *</label>
											<input type="text" class="form-control form-control-lg" id="code" name="code" placeholder="Enter Referral Code" value="<?php echo $dash_data['admin_referralCode']?>">
										</div>
										
										<div class="form-group">
											<input type="submit" class="btn btn-success" id="btnadd" name="update" value="update">
										</div>
									</form>
									
								</div>
							</div>
						</div>
                </div>
             
            </div>
         </div>
      </div>
      <!-- ============================================================== -->
      <!-- footer -->
      <!-- ============================================================== -->
      <?php include('footer.php');?>
      <!-- ============================================================== -->
      <!-- end footer -->
      <!-- ============================================================== -->
      </div>
      </div>
      <!-- ============================================================== -->
      <!-- end main wrapper -->
      <!-- ============================================================== -->
      <!-- Optional JavaScript -->
      <?php include('js.php');?>
      <script>
         $('.lidashboard a').addClass('active');
      </script>
   </body>
</html>
